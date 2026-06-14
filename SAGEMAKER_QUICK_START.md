# 🚀 SageMaker + FastAPI Integration - Quick Reference

## Overview

Your ValliGuard FastAPI backend now supports **AWS SageMaker endpoints** for fraud detection!

---

## Quick Start (5 minutes)

### 1️⃣ **Get Your SageMaker Endpoint Name**

From your Jupyter notebook notebook, get the endpoint name:

```python
# After deploying
print(predictor.endpoint_name)
# Output: paysim-xgb-2026-06-04-17-31-22-321
```

### 2️⃣ **Configure Environment**

Create `Backend/.env` file:

```bash
USE_SAGEMAKER=true
SAGEMAKER_ENDPOINT_NAME=paysim-xgb-2026-06-04-17-31-22-321
AWS_REGION=ap-south-1
```

### 3️⃣ **Setup AWS Credentials**

```bash
aws configure
# Enter Access Key ID and Secret Access Key
```

### 4️⃣ **Install Dependencies**

```bash
cd Backend
pip install -r requirements.txt  # Now includes boto3 and sagemaker
```

### 5️⃣ **Start API**

```bash
cd Backend
python main.py
```

You should see:
```
🚀 Using AWS SageMaker Endpoint
```

---

## Testing

### Test Health Endpoint

```bash
curl http://localhost:8001/health
```

Response:
```json
{
  "status": "API is running successfully (SageMaker Endpoint)",
  "model_loaded": true
}
```

### Test Single Prediction

```bash
curl -X POST http://localhost:8001/predict \
  -H "Content-Type: application/json" \
  -d '{
    "step": 1,
    "type": "TRANSFER",
    "amount": 10000,
    "oldbalanceOrg": 50000,
    "newbalanceOrig": 40000,
    "oldbalanceDest": 0,
    "newbalanceDest": 10000
  }'
```

### Test Bulk Upload

```bash
curl -X POST http://localhost:8001/bulk-predict \
  -F "file=@sample_transactions.csv"
```

---

## Automation Setup

Run the interactive setup script:

```bash
cd Backend
python setup_sagemaker.py setup
```

This will:
1. ✅ Verify AWS credentials
2. ✅ List available endpoints
3. ✅ Let you select an endpoint
4. ✅ Test the endpoint
5. ✅ Create `.env` file automatically

---

## Helpful Commands

### Check Credentials
```bash
python setup_sagemaker.py check
```

### List Endpoints
```bash
python setup_sagemaker.py list
```

### Test Endpoint
```bash
python setup_sagemaker.py test paysim-xgb-2026-06-04-17-31-22-321
```

---

## Mode Comparison

| Aspect | Local Model | SageMaker |
|--------|-------------|-----------|
| Speed | ⚡ 10ms | 🟢 50-200ms |
| Scalability | ❌ Limited | ✅ Unlimited |
| Maintenance | 🔧 Manual | ✅ AWS Managed |
| Cost | 💰 One-time | 💵 Per-use |
| Setup | ✅ Easy | 🟢 Medium |

---

## Architecture

```
┌─────────────────┐
│    Frontend     │
│   (React App)   │
└────────┬────────┘
         │
         │ HTTP Requests
         ↓
┌─────────────────┐        ┌──────────────┐
│   FastAPI       │◄──────►│   SageMaker  │
│   (localhost:   │        │   Endpoint   │
│    8001)        │        │  (AWS Cloud) │
└─────────────────┘        └──────────────┘
         │
         │ JSON Response
         ↓
┌─────────────────┐
│   Dashboard     │
│  (Results UI)   │
└─────────────────┘
```

---

## Environment Variables Reference

| Variable | Required | Default | Example |
|----------|----------|---------|---------|
| `USE_SAGEMAKER` | No | `false` | `true` |
| `SAGEMAKER_ENDPOINT_NAME` | Yes* | - | `paysim-xgb-...` |
| `AWS_REGION` | No | `ap-south-1` | `us-east-1` |

*Required only if `USE_SAGEMAKER=true`

---

## File Changes Summary

### Modified Files
- ✅ `Backend/main.py` - Added SageMaker support
- ✅ `Backend/requirements.txt` - Added boto3, sagemaker

### New Files
- 📄 `Backend/.env.example` - Environment template
- 🐍 `Backend/setup_sagemaker.py` - Setup helper script
- 📖 `SAGEMAKER_INTEGRATION.md` - Full documentation

---

## Troubleshooting

| Error | Solution |
|-------|----------|
| "SageMaker endpoint not available" | Check `.env` file, verify endpoint name |
| "Access Denied" | Run `aws configure`, check credentials |
| "Endpoint not found" | Run `python setup_sagemaker.py list` |
| Slow predictions | Check network latency, endpoint status |

---

## What's Automatic

✅ **Same API** - No frontend changes needed  
✅ **Same Response Format** - Predictions look identical  
✅ **Automatic Failover** - Can switch modes by changing `.env`  
✅ **Batch Support** - Bulk uploads work with SageMaker  

---

## Next Steps

1. ✅ Update backend dependencies
2. ✅ Configure SageMaker endpoint
3. ✅ Test with `setup_sagemaker.py`
4. ✅ Start FastAPI server
5. ✅ Verify with curl/Postman
6. ✅ Frontend automatically works (no changes needed)

---

## Cost Estimation

**SageMaker XGBoost ml.m5.xlarge:**
- 24/7: ~$144/month
- Business hours (8am-5pm): ~$60/month  
- Development: ~$20/month

---

## Support & Documentation

- 📖 Full guide: See `SAGEMAKER_INTEGRATION.md`
- 🐍 Setup helper: `python Backend/setup_sagemaker.py`
- 🧪 Test endpoint: `python Backend/setup_sagemaker.py test <endpoint>`
- 📋 List endpoints: `python Backend/setup_sagemaker.py list`

---

## API Endpoints (Same for both modes)

```
GET  /health              - Check API status
POST /predict            - Single transaction prediction
POST /predict/batch      - Batch predictions (max 500)
POST /bulk-predict       - Upload CSV/Excel file
GET  /model/info         - Model metadata
```

---

**All endpoints work identically whether using local model or SageMaker!** 🎉
