from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pickle
import numpy as np
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Enable CORS (for React frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request body schema
class PredictionRequest(BaseModel):
    features: list

# Load model and artifacts
try:
    model = pickle.load(open("model_output/xgb_model.pkl", "rb"))
    scaler = pickle.load(open("model_output/scaler.pkl", "rb"))
    encoders = pickle.load(open("model_output/encoders.pkl", "rb"))
    feature_names = pickle.load(open("model_output/features.pkl", "rb"))
    print("Model and artifacts loaded successfully!")
except FileNotFoundError:
    print("Error: Model files not found. Run train_model.py first.")

@app.post("/predict")
def predict(request: PredictionRequest):
    try:
        # Convert input to numpy array
        features = np.array(request.features).reshape(1, -1)

        # Scale features
        features_scaled = scaler.transform(features)

        # Prediction
        prediction = model.predict(features_scaled)
        probability = model.predict_proba(features_scaled)[0][1]

        result = "Fraud" if prediction[0] == 1 else "Normal"

        return {
            "prediction": result,
            "fraud_probability": round(float(probability), 4)
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Run using: uvicorn main:app --reload --port 5000