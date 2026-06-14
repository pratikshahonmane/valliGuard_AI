# SageMaker Integration Guide

## Overview

The ValliGuard API now supports both **local joblib models** and **AWS SageMaker endpoints** for fraud detection predictions.

---

## Setup Options

### Option 1: Local Model (Default)

Use this if you have a trained local model.

**Requirements:**
- `fraud_model.pkl` in `Backend/model/` directory
- `features.pkl` in `Backend/model/` directory
- `label_encoder.pkl` in `Backend/model/` directory

**Start the API:**
```bash
cd Backend
python main.py
```

The API will automatically load local models and run in local mode.

---

### Option 2: AWS SageMaker Endpoint

Use this if you have a trained model deployed on AWS SageMaker.

#### Step 1: Deploy Model on SageMaker

From your Jupyter notebook:

```python
from sagemaker.serializers import CSVSerializer

# Deploy endpoint
predictor = clf.deploy(
    initial_instance_count=1,
    instance_type="ml.m5.xlarge",
    serializer=CSVSerializer()
)

# Get endpoint name
endpoint_name = predictor.endpoint_name
print(f"Endpoint Name: {endpoint_name}")
```

#### Step 2: Configure Environment Variables

Create a `.env` file in the `Backend/` directory:

```bash
# .env file
USE_SAGEMAKER=true
SAGEMAKER_ENDPOINT_NAME=paysim-xgb-2026-06-04-17-31-22-321
AWS_REGION=ap-south-1
```

Or set environment variables in your terminal:

**Windows (PowerShell):**
```powershell
$env:USE_SAGEMAKER = "true"
$env:SAGEMAKER_ENDPOINT_NAME = "paysim-xgb-2026-06-04-17-31-22-321"
$env:AWS_REGION = "ap-south-1"
```

**Linux/macOS:**
```bash
export USE_SAGEMAKER=true
export SAGEMAKER_ENDPOINT_NAME=paysim-xgb-2026-06-04-17-31-22-321
export AWS_REGION=ap-south-1
```

#### Step 3: Configure AWS Credentials

Ensure you have AWS credentials configured:

**Option A: AWS CLI Configuration**
```bash
aws configure
```

Enter your AWS Access Key ID and Secret Access Key when prompted.

**Option B: Environment Variables**
```bash
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
```

**Option C: AWS Credentials File**

Create `~/.aws/credentials` (macOS/Linux) or `C:\Users\<YourUsername>\.aws\credentials` (Windows):

```
[default]
aws_access_key_id = your_access_key
aws_secret_access_key = your_secret_key
```

#### Step 4: Install Dependencies

```bash
cd Backend
pip install -r requirements.txt
```

The updated `requirements.txt` includes `boto3` and `sagemaker`.

#### Step 5: Start the API with SageMaker

```bash
cd Backend
python main.py
```

The API will load the SageMaker endpoint and display:
```
🚀 Using AWS SageMaker Endpoint
```

---

## Testing the Integration

### Test 1: Health Check

```bash
curl http://localhost:8001/health
```

Response:
```json
{
  "status": "API is running successfully (SageMaker Endpoint)",
  "model_loaded": true,
  "model_version": "1.0.0"
}
```

### Test 2: Single Prediction

```bash
curl -X POST http://localhost:8001/predict \
  -H "Content-Type: application/json" \
  -d '{
    "step": 1,
    "type": "TRANSFER",
    "amount": 10000.0,
    "oldbalanceOrg": 50000.0,
    "newbalanceOrig": 40000.0,
    "oldbalanceDest": 0.0,
    "newbalanceDest": 10000.0
  }'
```

Response:
```json
{
  "prediction": "legitimate",
  "fraud_probability": 0.12,
  "risk_level": "low",
  "confidence": 0.88,
  "model_version": "1.0.0"
}
```

### Test 3: Model Info

```bash
curl http://localhost:8001/model/info
```

Response:
```json
{
  "model_type": "SageMaker XGBoost Endpoint",
  "endpoint_name": "paysim-xgb-2026-06-04-17-31-22-321",
  "features": [...],
  "n_features": 14,
  "supported_transaction_types": ["TRANSFER", "CASH_OUT"],
  "version": "1.0.0",
  "inference_source": "AWS SageMaker"
}
```

---

## Key Features

### Local Model Mode
```
✅ No AWS credentials needed
✅ Fast inference (in-process)
✅ Good for development/testing
❌ Limited scalability
❌ Model loaded in memory
```

### SageMaker Mode
```
✅ Scalable (auto-scaling instances)
✅ Production-ready
✅ Managed by AWS
✅ High availability
❌ Network latency
❌ Requires AWS account
```

---

## Troubleshooting

### Error: "SageMaker endpoint not available"

**Solution:** Check that:
1. `USE_SAGEMAKER=true` is set
2. `SAGEMAKER_ENDPOINT_NAME` is correctly set
3. AWS credentials are configured
4. Endpoint is active in AWS SageMaker console

### Error: "Access Denied" to SageMaker

**Solution:** Verify AWS credentials:
```bash
aws sts get-caller-identity
```

Should return your AWS account info.

### Error: "Endpoint not found"

**Solution:** Check endpoint name:
```python
import boto3
sm = boto3.client('sagemaker', region_name='ap-south-1')
response = sm.list_endpoints()
for ep in response['Endpoints']:
    print(ep['EndpointName'], ep['EndpointStatus'])
```

### Slow Predictions

**Solution:** If using SageMaker endpoint over the network:
1. Check network latency to AWS
2. Use instance closer to your application
3. Increase instance type for higher throughput
4. Check SageMaker CloudWatch logs

---

## API Behavior Comparison

| Feature | Local Model | SageMaker |
|---------|-------------|-----------|
| Inference Speed | < 10ms | 50-200ms |
| Scalability | Limited | Unlimited |
| Cost Model | One-time | Pay-per-use |
| Maintenance | Manual | AWS Managed |
| Availability | Single instance | Multi-AZ |
| Auto-scaling | Manual | Auto |

---

## Configuration Files Reference

### Full .env Example

```bash
# Model Source
USE_SAGEMAKER=true

# SageMaker Configuration
SAGEMAKER_ENDPOINT_NAME=paysim-xgb-2026-06-04-17-31-22-321
AWS_REGION=ap-south-1

# AWS Credentials (optional - if not using ~/.aws/credentials)
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

### Using python-dotenv

Install:
```bash
pip install python-dotenv
```

Add to `Backend/main.py`:
```python
from dotenv import load_dotenv
load_dotenv()

USE_SAGEMAKER = os.getenv("USE_SAGEMAKER", "false").lower() == "true"
```

---

## Advanced: Batch Predictions with SageMaker

The batch prediction endpoint also supports SageMaker:

```bash
# Upload CSV file
curl -X POST http://localhost:8001/bulk-predict \
  -F "file=@sample_transactions.csv"
```

Each transaction in the CSV is sent to the SageMaker endpoint individually, compiled, and returned as a single response.

### Performance Note

For large bulk predictions (10,000+ rows), consider:
1. Using SageMaker Batch Transform instead
2. Chunking requests and processing in parallel
3. Increasing instance count for the endpoint

---

## Cost Estimation

### SageMaker XGBoost ml.m5.xlarge Instance

**On-Demand Pricing (ap-south-1):**
- Instance: ~$0.20/hour
- Data Transfer: ~$0.02/GB

**Example Monthly Cost:**
- 24/7 running: ~$144/month (instance) + data transfer
- 8-5 business: ~$60/month (instance) + data transfer
- Development: ~$20/month

**Cost Optimization:**
- Use auto-scaling to add/remove instances
- Schedule endpoint stop during off-hours
- Batch predictions to reduce overhead

---

## Production Deployment Checklist

- [ ] SageMaker endpoint deployed and tested
- [ ] AWS credentials securely configured
- [ ] `USE_SAGEMAKER=true` environment variable set
- [ ] Endpoint name verified in SageMaker console
- [ ] Health check endpoint responds correctly
- [ ] Prediction latency acceptable (<200ms)
- [ ] Error handling and logging in place
- [ ] Auto-scaling configured (if needed)
- [ ] CloudWatch monitoring enabled
- [ ] Backup/failover plan documented

---

## Switching Between Local and SageMaker

### To use Local Model:
```bash
# Unset or set to false
export USE_SAGEMAKER=false
python main.py
```

### To use SageMaker:
```bash
# Configure and set
export USE_SAGEMAKER=true
export SAGEMAKER_ENDPOINT_NAME=your-endpoint-name
export AWS_REGION=ap-south-1
python main.py
```

Both modes support the exact same API interface, so no frontend changes are needed!

---

## Support

For issues:
1. Check CloudWatch logs in SageMaker console
2. Verify endpoint is in "InService" status
3. Review AWS IAM permissions
4. Check network connectivity to AWS

