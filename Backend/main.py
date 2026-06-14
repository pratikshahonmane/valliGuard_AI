"""
VALLI API
FastAPI production service with real ML model inference
Supports: Local joblib models or AWS SageMaker endpoints
"""

from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel, Field, validator
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import numpy as np
import joblib
import os
from typing import Literal
import pandas as pd
import io
import csv
import boto3
from sagemaker.predictor import Predictor
from sagemaker.serializers import CSVSerializer

# ── Configuration ──────────────────────────────────────────────────────────────
USE_SAGEMAKER = os.getenv("USE_SAGEMAKER", "false").lower() == "true"
SAGEMAKER_ENDPOINT_NAME = os.getenv("SAGEMAKER_ENDPOINT_NAME", "")
AWS_REGION = os.getenv("AWS_REGION", "ap-south-1")

# ── Model loading ──────────────────────────────────────────────────────────────
MODEL_DIR = "model"

def load_artifacts():
    """Load local joblib artifacts if using local model."""
    model_path    = os.path.join(MODEL_DIR, "fraud_model.pkl")
    features_path = os.path.join(MODEL_DIR, "features.pkl")
    encoder_path  = os.path.join(MODEL_DIR, "label_encoder.pkl")

    if not all(os.path.exists(p) for p in [model_path, features_path, encoder_path]):
        return None, None, None

    model    = joblib.load(model_path)
    features = joblib.load(features_path)
    encoder  = joblib.load(encoder_path)
    return model, features, encoder


def load_sagemaker_endpoint():
    """Load SageMaker endpoint for inference."""
    if not SAGEMAKER_ENDPOINT_NAME:
        return None
    
    try:
        predictor = Predictor(
            endpoint_name=SAGEMAKER_ENDPOINT_NAME,
            sagemaker_session=None,  # Uses default session
            serializer=CSVSerializer()
        )
        return predictor
    except Exception as e:
        print(f"Failed to load SageMaker endpoint: {e}")
        return None


# Load model/endpoint
if USE_SAGEMAKER:
    print("🚀 Using AWS SageMaker Endpoint")
    predictor = load_sagemaker_endpoint()
    model, FEATURES, label_encoder = None, None, None
else:
    print("📦 Using Local Joblib Model")
    model, FEATURES, label_encoder = load_artifacts()
    predictor = None

# ── App ────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="VALLI API",
    description="Real-time financial transaction fraud detection using ML",
    version="1.0.0"
)

# This MUST be defined before your routes to prevent CORS errors
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ── Schemas ────────────────────────────────────────────────────────────────────
class TransactionRequest(BaseModel):
    step: int = Field(..., description="Hour of simulation (1–744)", example=1)
    type: Literal["TRANSFER", "CASH_OUT"] = Field(..., description="Transaction type")
    amount: float = Field(..., gt=0, description="Transaction amount", example=181.0)
    oldbalanceOrg: float = Field(..., ge=0, description="Sender balance before", example=181.0)
    newbalanceOrig: float = Field(..., ge=0, description="Sender balance after", example=0.0)
    oldbalanceDest: float = Field(..., ge=0, description="Receiver balance before", example=0.0)
    newbalanceDest: float = Field(..., ge=0, description="Receiver balance after", example=0.0)

    @validator("type")
    def validate_type(cls, v):
        if v not in ("TRANSFER", "CASH_OUT"):
            raise ValueError("type must be TRANSFER or CASH_OUT")
        return v


class PredictionResponse(BaseModel):
    prediction: Literal["fraud", "legitimate"]
    fraud_probability: float
    risk_level: Literal["low", "medium", "high", "critical"]
    confidence: float
    model_version: str = "1.0.0"


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    model_version: str = "1.0.0"


class BatchTransactionRequest(BaseModel):
    transactions: list[TransactionRequest]


class BatchPredictionResponse(BaseModel):
    results: list[PredictionResponse]
    total: int
    fraud_count: int


class BulkPredictionResult(BaseModel):
    step: int
    type: str
    amount: float
    oldbalanceOrg: float
    newbalanceOrig: float
    oldbalanceDest: float
    newbalanceDest: float
    prediction: str
    fraud_probability: float
    risk_score: float
    risk_level: str


class BulkPredictionResponse(BaseModel):
    total: int
    fraud_count: int
    safe_count: int
    fraud_percentage: float
    results: list[BulkPredictionResult]

# ── Feature engineering (mirrors train_model.py) ───────────────────────────────
def build_features(tx: TransactionRequest) -> np.ndarray:
    """Build feature vector from transaction (for local model)."""
    if label_encoder is None:
        raise HTTPException(
            status_code=503,
            detail="Label encoder not available. Using SageMaker endpoint."
        )
    
    type_enc = int(label_encoder.transform([tx.type])[0])

    balance_diff_orig       = tx.oldbalanceOrg - tx.newbalanceOrig
    balance_diff_dest       = tx.newbalanceDest - tx.oldbalanceDest
    amount_to_orig_balance  = tx.amount / tx.oldbalanceOrg if tx.oldbalanceOrg > 0 else 0.0
    orig_balance_zero       = int(tx.newbalanceOrig == 0)
    dest_balance_zero       = int(tx.oldbalanceDest == 0)
    error_balance_orig      = tx.oldbalanceOrg - tx.amount - tx.newbalanceOrig
    error_balance_dest      = tx.oldbalanceDest + tx.amount - tx.newbalanceDest

    row = [
        tx.step, type_enc, tx.amount,
        tx.oldbalanceOrg, tx.newbalanceOrig,
        tx.oldbalanceDest, tx.newbalanceDest,
        balance_diff_orig, balance_diff_dest,
        amount_to_orig_balance, orig_balance_zero,
        dest_balance_zero, error_balance_orig, error_balance_dest
    ]
    return np.array(row).reshape(1, -1)


def build_features_for_sagemaker(tx: TransactionRequest) -> str:
    """Build feature string for SageMaker (CSV format)."""
    # Map transaction type to numeric (same as label encoder)
    type_map = {"TRANSFER": 1, "CASH_OUT": 2}
    type_enc = type_map.get(tx.type, 1)

    balance_diff_orig       = tx.oldbalanceOrg - tx.newbalanceOrig
    balance_diff_dest       = tx.newbalanceDest - tx.oldbalanceDest
    amount_to_orig_balance  = tx.amount / tx.oldbalanceOrg if tx.oldbalanceOrg > 0 else 0.0
    orig_balance_zero       = int(tx.newbalanceOrig == 0)
    dest_balance_zero       = int(tx.oldbalanceDest == 0)
    error_balance_orig      = tx.oldbalanceOrg - tx.amount - tx.newbalanceOrig
    error_balance_dest      = tx.oldbalanceDest + tx.amount - tx.newbalanceDest

    features = [
        tx.step, type_enc, tx.amount,
        tx.oldbalanceOrg, tx.newbalanceOrig,
        tx.oldbalanceDest, tx.newbalanceDest,
        balance_diff_orig, balance_diff_dest,
        amount_to_orig_balance, orig_balance_zero,
        dest_balance_zero, error_balance_orig, error_balance_dest
    ]
    # Return as CSV string for SageMaker
    return ",".join(str(f) for f in features)


def risk_label(prob: float) -> str:
    if prob < 0.25:
        return "low"
    elif prob < 0.50:
        return "medium"
    elif prob < 0.75:
        return "high"
    return "critical"


def make_prediction(tx: TransactionRequest) -> PredictionResponse:
    """Make prediction using either local model or SageMaker endpoint."""
    
    if USE_SAGEMAKER and predictor:
        # Use SageMaker endpoint
        if predictor is None:
            raise HTTPException(
                status_code=503,
                detail="SageMaker endpoint not available."
            )
        
        try:
            # Build features for SageMaker (CSV format)
            features_csv = build_features_for_sagemaker(tx)
            
            # Get prediction from SageMaker
            result = predictor.predict(features_csv)
            
            # Parse result
            if isinstance(result, bytes):
                result = result.decode("utf-8")
            
            # SageMaker XGBoost returns probability for class 1 (fraud)
            proba = float(result.strip())
            
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"SageMaker prediction failed: {str(e)}"
            )
    else:
        # Use local model
        if model is None:
            raise HTTPException(
                status_code=503,
                detail="Model not loaded. Run train_model.py first."
            )
        
        X = build_features(tx)
        proba = float(model.predict_proba(X)[0][1])
    
    # Normalize probability to [0, 1]
    proba = max(0.0, min(1.0, proba))
    pred = "fraud" if proba >= 0.5 else "legitimate"
    conf = proba if pred == "fraud" else 1 - proba

    return PredictionResponse(
        prediction=pred,
        fraud_probability=round(proba, 4),
        risk_level=risk_label(proba),
        confidence=round(conf, 4)
    )


# ── CSV/Excel Parsing ──────────────────────────────────────────────────────────
REQUIRED_COLUMNS = [
    "step", "type", "amount", "oldbalanceOrg", 
    "newbalanceOrig", "oldbalanceDest", "newbalanceDest"
]


def validate_dataframe(df: pd.DataFrame) -> tuple[bool, str]:
    """Validate that dataframe has all required columns."""
    missing = [col for col in REQUIRED_COLUMNS if col not in df.columns]
    if missing:
        return False, f"Invalid file format. Missing columns: {', '.join(missing)}"
    return True, "Valid"


def parse_csv_data(file_content: bytes, filename: str) -> pd.DataFrame:
    """Parse CSV or Excel file and return DataFrame."""
    try:
        if filename.endswith(".xlsx") or filename.endswith(".xls"):
            # Read Excel file
            df = pd.read_excel(io.BytesIO(file_content))
        else:
            # Read CSV file
            df = pd.read_csv(io.BytesIO(file_content))
        return df
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error parsing file: {str(e)}")


def process_bulk_predictions(df: pd.DataFrame) -> BulkPredictionResponse:
    """Process all transactions and return predictions."""
    if model is None and (not USE_SAGEMAKER or predictor is None):
        raise HTTPException(
            status_code=503,
            detail="Model not loaded and SageMaker endpoint not available. Run train_model.py or configure SageMaker."
        )
    
    # Validate columns
    is_valid, msg = validate_dataframe(df)
    if not is_valid:
        raise HTTPException(status_code=400, detail=msg)
    
    results = []
    fraud_count = 0
    
    # Process each row
    for idx, row in df.iterrows():
        try:
            # Create transaction request from row
            tx = TransactionRequest(
                step=int(row["step"]),
                type=str(row["type"]),
                amount=float(row["amount"]),
                oldbalanceOrg=float(row["oldbalanceOrg"]),
                newbalanceOrig=float(row["newbalanceOrig"]),
                oldbalanceDest=float(row["oldbalanceDest"]),
                newbalanceDest=float(row["newbalanceDest"])
            )
            
            # Get prediction
            pred = make_prediction(tx)
            
            # Add to results
            result = BulkPredictionResult(
                step=tx.step,
                type=tx.type,
                amount=tx.amount,
                oldbalanceOrg=tx.oldbalanceOrg,
                newbalanceOrig=tx.newbalanceOrig,
                oldbalanceDest=tx.oldbalanceDest,
                newbalanceDest=tx.newbalanceDest,
                prediction=pred.prediction,
                fraud_probability=pred.fraud_probability,
                risk_score=round(pred.fraud_probability * 100, 2),
                risk_level=pred.risk_level
            )
            results.append(result)
            
            if pred.prediction == "fraud":
                fraud_count += 1
                
        except Exception as e:
            # Skip invalid rows and continue
            print(f"Skipping row {idx}: {str(e)}")
            continue
    
    safe_count = len(results) - fraud_count
    fraud_percentage = (fraud_count / len(results) * 100) if results else 0
    
    return BulkPredictionResponse(
        total=len(results),
        fraud_count=fraud_count,
        safe_count=safe_count,
        fraud_percentage=round(fraud_percentage, 2),
        results=results
    )

# ── Routes ─────────────────────────────────────────────────────────────────────
@app.get("/health", response_model=HealthResponse, tags=["System"])
def health_check():
    """Check API and model/endpoint status."""
    is_loaded = model is not None or (USE_SAGEMAKER and predictor is not None)
    status_msg = "API is running successfully"
    if USE_SAGEMAKER:
        status_msg += " (SageMaker Endpoint)"
    else:
        status_msg += " (Local Model)"
    
    return HealthResponse(
        status=status_msg,
        model_loaded=is_loaded
    )


@app.post("/predict", response_model=PredictionResponse, tags=["Prediction"])
def predict(transaction: TransactionRequest):
    """
    Predict whether a single transaction is fraudulent.

    - Only TRANSFER and CASH_OUT types are supported (fraud only occurs in these).
    - Returns fraud probability, prediction label, and risk level.
    - Works with both local model and SageMaker endpoint.
    """
    if model is None and (not USE_SAGEMAKER or predictor is None):
        raise HTTPException(
            status_code=503,
            detail="Model not loaded and SageMaker endpoint not available."
        )
    return make_prediction(transaction)


@app.post("/predict/batch", response_model=BatchPredictionResponse, tags=["Prediction"])
def predict_batch(request: BatchTransactionRequest):
    """
    Predict fraud for a batch of transactions (max 500).
    Works with both local model and SageMaker endpoint.
    """
    if model is None and (not USE_SAGEMAKER or predictor is None):
        raise HTTPException(
            status_code=503,
            detail="Model not loaded and SageMaker endpoint not available."
        )
    if len(request.transactions) > 500:
        raise HTTPException(status_code=400, detail="Batch size cannot exceed 500.")

    results = [make_prediction(tx) for tx in request.transactions]
    fraud_count = sum(1 for r in results if r.prediction == "fraud")

    return BatchPredictionResponse(
        results=results,
        total=len(results),
        fraud_count=fraud_count
    )


@app.get("/model/info", tags=["System"])
def model_info():
    """Return model metadata and feature list."""
    if USE_SAGEMAKER:
        if predictor is None:
            raise HTTPException(status_code=503, detail="SageMaker endpoint not loaded.")
        return {
            "model_type": "SageMaker XGBoost Endpoint",
            "endpoint_name": SAGEMAKER_ENDPOINT_NAME,
            "features": [
                "step", "type", "amount", "oldbalanceOrg", "newbalanceOrig",
                "oldbalanceDest", "newbalanceDest", "balance_diff_orig", 
                "balance_diff_dest", "amount_to_orig_balance", "orig_balance_zero",
                "dest_balance_zero", "error_balance_orig", "error_balance_dest"
            ],
            "n_features": 14,
            "supported_transaction_types": ["TRANSFER", "CASH_OUT"],
            "version": "1.0.0",
            "inference_source": "AWS SageMaker"
        }
    else:
        if model is None:
            raise HTTPException(status_code=503, detail="Model not loaded.")
        return {
            "model_type": type(model).__name__,
            "features": FEATURES,
            "n_features": len(FEATURES),
            "supported_transaction_types": ["TRANSFER", "CASH_OUT"],
            "version": "1.0.0",
            "inference_source": "Local Model"
        }


@app.post("/bulk-predict", response_model=BulkPredictionResponse, tags=["Prediction"])
def bulk_predict(file: UploadFile = File(...)):
    """
    Predict fraud for bulk transactions from CSV or Excel file.
    
    Supports:
    - .csv files
    - .xlsx files
    - .xls files
    
    Required columns:
    step, type, amount, oldbalanceOrg, newbalanceOrig, oldbalanceDest, newbalanceDest
    """
    if model is None and (not USE_SAGEMAKER or predictor is None):
        raise HTTPException(
            status_code=503,
            detail="Model not loaded and SageMaker endpoint not available. Run train_model.py or configure SageMaker."
        )
    
    # Validate file type
    allowed_types = {".csv", ".xlsx", ".xls"}
    file_ext = os.path.splitext(file.filename)[1].lower()
    
    if file_ext not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_types)}"
        )
    
    # Read file content
    try:
        content = file.file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading file: {str(e)}")
    
    # Parse CSV/Excel
    df = parse_csv_data(content, file.filename)
    
    # Process and return predictions
    return process_bulk_predictions(df)