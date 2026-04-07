import csv
import numpy as np
import joblib
import os
import boto3

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    classification_report, confusion_matrix,
    roc_auc_score, average_precision_score
)
from sklearn.preprocessing import LabelEncoder

# ── CONFIG ────────────────────────────────────────────────────────────────
MODEL_DIR = "model"

# S3 (DATA SOURCE)
S3_DATA_BUCKET = "valli-ai-poc-data"
S3_DATA_KEY = "PS_20174392719_1491204439457_log.csv"  # change if inside folder

# S3 (MODEL STORAGE)
S3_BUCKET = "valli-ai-models-224989089359-ap-south-1-an"
S3_PREFIX = "models"

os.makedirs(MODEL_DIR, exist_ok=True)

VALID_TYPES = {"TRANSFER", "CASH_OUT"}

# ── LOAD DATA FROM S3 ─────────────────────────────────────────────────────
def load_data_from_s3():
    print("📥 Loading dataset from S3...")

    s3 = boto3.client("s3", region_name="ap-south-1")

    response = s3.get_object(
        Bucket=S3_DATA_BUCKET,
        Key=S3_DATA_KEY
    )

    lines = response["Body"].iter_lines()

    reader = csv.DictReader(
        (line.decode("utf-8") for line in lines)
    )

    rows = []

    for row in reader:
        if row["type"] not in VALID_TYPES:
            continue

        rows.append([
            int(row["step"]),
            row["type"],
            float(row["amount"]),
            float(row["oldbalanceOrg"]),
            float(row["newbalanceOrig"]),
            float(row["oldbalanceDest"]),
            float(row["newbalanceDest"]),
            int(row["isFraud"]),
        ])

    print(f"✅ Loaded {len(rows):,} rows from S3")
    return rows

# ── FEATURE ENGINEERING ───────────────────────────────────────────────────
def build_features(rows, label_encoder=None, fit_encoder=True):
    types = [r[1] for r in rows]

    if fit_encoder:
        le = LabelEncoder()
        type_enc = le.fit_transform(types)
    else:
        le = label_encoder
        type_enc = le.transform(types)

    X_list, y_list = [], []

    for i, r in enumerate(rows):
        step, _, amount, old_orig, new_orig, old_dest, new_dest, label = r
        te = type_enc[i]

        X_list.append([
            step, te, amount,
            old_orig, new_orig,
            old_dest, new_dest,
            old_orig - new_orig,
            new_dest - old_dest,
            amount / old_orig if old_orig > 0 else 0.0,
            int(new_orig == 0),
            int(old_dest == 0),
            old_orig - amount - new_orig,
            old_dest + amount - new_dest
        ])
        y_list.append(label)

    return np.array(X_list), np.array(y_list), le

FEATURES = [
    "step", "type_enc", "amount",
    "oldbalanceOrg", "newbalanceOrig",
    "oldbalanceDest", "newbalanceDest",
    "balance_diff_orig", "balance_diff_dest",
    "amount_to_orig_balance", "orig_balance_zero",
    "dest_balance_zero", "error_balance_orig", "error_balance_dest"
]

# ── TRAIN MODEL ───────────────────────────────────────────────────────────
def train(X, y):
    print(f"📊 Fraud rate: {y.mean():.4%}")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42
    )

    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=20,
        min_samples_leaf=10,
        class_weight="balanced",
        n_jobs=-1,
        random_state=42
    )

    print("⚙️ Training model...")
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]

    print("\n📈 Classification Report:")
    print(classification_report(y_test, y_pred))

    print("ROC-AUC:", roc_auc_score(y_test, y_proba))
    print("PR-AUC:", average_precision_score(y_test, y_proba))

    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test, y_pred))

    return model

# ── SAVE + UPLOAD TO S3 ───────────────────────────────────────────────────
def save_artifacts(model, le):
    print("💾 Saving artifacts...")

    model_path = os.path.join(MODEL_DIR, "fraud_model.pkl")
    le_path = os.path.join(MODEL_DIR, "label_encoder.pkl")
    feat_path = os.path.join(MODEL_DIR, "features.pkl")

    joblib.dump(model, model_path)
    joblib.dump(le, le_path)
    joblib.dump(FEATURES, feat_path)

    print("☁️ Uploading to S3...")

    s3 = boto3.client("s3", region_name="ap-south-1")

    s3.upload_file(model_path, S3_BUCKET, f"{S3_PREFIX}/fraud_model.pkl")
    s3.upload_file(le_path, S3_BUCKET, f"{S3_PREFIX}/label_encoder.pkl")
    s3.upload_file(feat_path, S3_BUCKET, f"{S3_PREFIX}/features.pkl")

    print(f"✅ Uploaded to S3 → {S3_BUCKET}/{S3_PREFIX}/")

# ── MAIN ──────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    rows = load_data_from_s3()

    X, y, le = build_features(rows)

    print(f"📐 Feature shape: {X.shape}")

    model = train(X, y)

    save_artifacts(model, le)

    print("\n🚀 Done. Model pipeline complete!")
