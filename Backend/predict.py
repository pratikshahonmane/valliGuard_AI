import pandas as pd
import pickle
import shap
import numpy as np

# Load saved objects
model = pickle.load(open("model_output/xgb_model.pkl", "rb"))
scaler = pickle.load(open("model_output/scaler.pkl", "rb"))
encoders = pickle.load(open("model_output/encoders.pkl", "rb"))
feature_columns = pickle.load(open("model_output/features.pkl", "rb"))


# -----------------------------
# Preprocess Input
# -----------------------------
def preprocess_input(data):

    df = pd.DataFrame([data])

    # Encode categorical values
    for col, encoder in encoders.items():

        if col in df.columns:

            df[col] = df[col].astype(str)

            df[col] = df[col].apply(
                lambda x: x if x in encoder.classes_ else encoder.classes_[0]
            )

            df[col] = encoder.transform(df[col])

    # Add missing columns
    for col in feature_columns:
        if col not in df.columns:
            df[col] = 0

    # Correct column order
    df = df[feature_columns]

    # Scale
    df_scaled = scaler.transform(df)

    return df_scaled, df


# -----------------------------
# SHAP Explanation
# -----------------------------
def explain_prediction(df_scaled):

    explainer = shap.TreeExplainer(model)

    shap_values = explainer.shap_values(df_scaled)

    # Handle binary classifier output
    if isinstance(shap_values, list):
        shap_values = shap_values[1]

    importance = pd.DataFrame({
        "feature": feature_columns,
        "impact": shap_values[0]
    })

    importance["abs"] = importance["impact"].abs()

    top = importance.sort_values(by="abs", ascending=False).head(5)

    return top["feature"].tolist()


# -----------------------------
# Generate Explanation
# -----------------------------
def generate_explanation(risk, features):

    if risk > 70:
        level = "High"
    elif risk > 40:
        level = "Medium"
    else:
        level = "Low"

    explanation = f"""
Fraud Risk Level: {level}

Important factors influencing the prediction:
{", ".join(features)}

The model detected unusual patterns in these features.
"""

    return explanation.strip()


# -----------------------------
# Predict Fraud
# -----------------------------
def predict_fraud(data):

    df_scaled, df_original = preprocess_input(data)

    prediction = int(model.predict(df_scaled)[0])

    prob = float(model.predict_proba(df_scaled)[0][1])

    risk = float(prob * 100)

    features = explain_prediction(df_scaled)

    explanation = generate_explanation(risk, features)

    return prediction, risk, features, explanation