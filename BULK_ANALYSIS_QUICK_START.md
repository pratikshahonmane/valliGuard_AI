# Bulk Transaction Analysis - Quick Start Guide

## ✨ Feature Overview

The **Bulk Transaction Analysis** feature allows you to:
- 📤 Upload CSV or Excel files with transaction data
- 🔄 Process 1,000-100,000+ transactions at once
- 📊 Get instant fraud predictions for all transactions
- 📈 View comprehensive statistics and charts
- 📥 Download results in multiple formats

---

## 🚀 Quick Start

### Step 1: Prepare Your Data

Create a CSV or Excel file with the following columns:

| Column | Type | Example | Description |
|--------|------|---------|-------------|
| step | integer | 1-744 | Hour in simulation |
| type | string | TRANSFER, CASH_OUT | Transaction type |
| amount | float | 1000.50 | Amount transferred |
| oldbalanceOrg | float | 50000 | Sender balance before |
| newbalanceOrig | float | 49000 | Sender balance after |
| oldbalanceDest | float | 1000 | Receiver balance before |
| newbalanceDest | float | 2000 | Receiver balance after |

### Example CSV:
```csv
step,type,amount,oldbalanceOrg,newbalanceOrig,oldbalanceDest,newbalanceDest
1,TRANSFER,10000,50000,40000,0,10000
2,TRANSFER,5000,40000,35000,10000,15000
3,CASH_OUT,25000,35000,10000,0,0
4,TRANSFER,1000,10000,9000,15000,16000
5,TRANSFER,50000,9000,-41000,16000,66000
```

### Example Excel:
Just use the same columns in an Excel spreadsheet.

---

## 📤 How to Upload

### Method 1: Click to Browse
1. Go to **"Bulk Analysis"** tab
2. Click **"Choose File"** button
3. Select your CSV or Excel file
4. File info will appear with record count

### Method 2: Drag & Drop
1. Go to **"Bulk Analysis"** tab
2. Drag your file over the upload zone
3. Drop to upload
4. Wait for validation

### What Happens:
✅ File is parsed (CSV or Excel automatically detected)  
✅ Required columns are validated  
✅ Record count is displayed  
✅ "Run Bulk Prediction" button becomes enabled  

---

## ⚠️ File Validation

### Required Columns
All these columns must exist in your file:
- ✓ step
- ✓ type
- ✓ amount
- ✓ oldbalanceOrg
- ✓ newbalanceOrig
- ✓ oldbalanceDest
- ✓ newbalanceDest

### File Format Requirements
- **Allowed formats**: .csv, .xlsx, .xls
- **Max rows**: 100,000+ (depends on system)
- **Character encoding**: UTF-8 recommended
- **Data types**: Numeric for amounts, text for type

### Error Messages
| Error | Solution |
|-------|----------|
| "Invalid file format. Required columns are missing: X, Y" | Add missing columns to your file |
| "Invalid file type. Allowed: .csv, .xlsx, .xls" | Convert file to correct format |
| "Error parsing file: ..." | Check file formatting and encoding |

---

## 🎯 Running Predictions

### Step 1: Upload File
1. Upload your CSV/Excel file
2. Verify record count is correct

### Step 2: Start Processing
1. Click **"▶️ Run Bulk Prediction"** button
2. Watch the animated 7-step pipeline:
   - 📁 File Upload
   - 📄 CSV Conversion
   - 🔍 Data Validation
   - ⚙️ Feature Engineering
   - 🤖 SageMaker Prediction
   - 📊 Result Generation
   - ⬇️ Download CSV

### Step 3: Processing Time
- 100 rows: ~5 seconds
- 1,000 rows: ~15 seconds
- 10,000 rows: ~2 minutes
- 100,000 rows: ~20 minutes

---

## 📊 Results Dashboard

After processing, you'll see:

### 1. Summary Cards
```
┌─────────────────┐  ┌─────────────────┐
│   Total: 1000   │  │  Fraud: 78      │
└─────────────────┘  └─────────────────┘
┌─────────────────┐  ┌─────────────────┐
│   Safe: 922     │  │  Fraud %: 7.8   │
└─────────────────┘  └─────────────────┘
```

### 2. Charts
- **Fraud vs Safe Pie Chart**: Visual distribution
- **Risk Distribution Bar**: Breakdown by risk level
- **Transaction Type Analysis**: Safe vs Fraud by type

### 3. Results Table
Shows first 20 predictions with:
- Transaction type
- Amount
- Prediction (FRAUD/LEGITIMATE)
- Risk score percentage
- Risk level (LOW/MEDIUM/HIGH/CRITICAL)

### 4. Download Options
- 📄 Download CSV
- 📋 Download JSON
- 🗂️ Download Excel

---

## 📥 Downloading Results

### CSV Format
```csv
step,type,amount,oldbalanceOrg,newbalanceOrig,oldbalanceDest,newbalanceDest,prediction,fraud_probability,risk_score,risk_level
1,TRANSFER,10000,50000,40000,0,10000,legitimate,0.12,12.0,low
2,CASH_OUT,250000,300000,50000,0,250000,fraud,0.95,95.0,critical
...
```

### JSON Format
```json
{
  "total": 1000,
  "fraud_count": 78,
  "safe_count": 922,
  "fraud_percentage": 7.8,
  "results": [
    {
      "step": 1,
      "type": "TRANSFER",
      "amount": 10000.0,
      "prediction": "legitimate",
      "fraud_probability": 0.12,
      "risk_score": 12.0,
      "risk_level": "low"
    },
    ...
  ]
}
```

---

## 🎨 Understanding Risk Levels

| Risk Level | Score Range | Color | Meaning |
|-----------|-------------|-------|---------|
| LOW | 0-25% | 🟢 Green | Safe transaction |
| MEDIUM | 25-50% | 🟠 Orange | Needs review |
| HIGH | 50-75% | 🔴 Red | Likely fraud |
| CRITICAL | 75-100% | 🔴 Dark Red | Definite fraud |

---

## 📝 Sample Test Files

### Small Test (10 rows)
```csv
step,type,amount,oldbalanceOrg,newbalanceOrig,oldbalanceDest,newbalanceDest
1,TRANSFER,10000,50000,40000,0,10000
2,TRANSFER,5000,40000,35000,10000,15000
3,CASH_OUT,25000,35000,10000,0,0
4,TRANSFER,1000,10000,9000,15000,16000
5,TRANSFER,50000,9000,-41000,16000,66000
6,CASH_OUT,100000,50000,-50000,5000,105000
7,TRANSFER,8000,25000,17000,3000,11000
8,TRANSFER,3500,17000,13500,11000,14500
9,CASH_OUT,75000,80000,5000,2000,77000
10,TRANSFER,2000,13500,11500,14500,16500
```

### Medium Test (100+ rows)
Use sample data from your actual transaction database or:
1. Download from Kaggle Financial Fraud Dataset
2. Prepare using the template above
3. Ensure all required columns are included

---

## 🔍 Troubleshooting

### Issue: File upload not working
**Solution:**
1. Check file is .csv, .xlsx, or .xls
2. Ensure backend is running (`http://localhost:8001`)
3. Try a smaller file first
4. Check browser console for errors

### Issue: "Invalid file format" error
**Solution:**
1. Verify all column names match exactly (case-sensitive)
2. Check for extra spaces in column names
3. Open file in Excel to verify formatting
4. Try exporting as CSV with UTF-8 encoding

### Issue: Predictions taking too long
**Solution:**
1. Large files (100K+ rows) can take 10-20 minutes
2. Try with a smaller file first
3. Check server CPU/memory usage
4. Consider splitting into smaller batches

### Issue: Charts not displaying
**Solution:**
1. Check browser console for errors
2. Verify JavaScript is enabled
3. Try refreshing the page
4. Use a modern browser (Chrome, Firefox, Safari)

---

## 💡 Tips & Best Practices

### ✓ Do's
- ✅ Validate data before uploading
- ✅ Use UTF-8 encoding for CSV files
- ✅ Start with small test file (10-100 rows)
- ✅ Keep column names exactly as specified
- ✅ Use realistic transaction amounts
- ✅ Batch similar transaction types together
- ✅ Download results immediately after processing

### ✗ Don'ts
- ❌ Don't change column order or names
- ❌ Don't mix different transaction types in same file
- ❌ Don't use special characters in values
- ❌ Don't upload corrupted files
- ❌ Don't refresh page during processing
- ❌ Don't manually edit generated CSV results

---

## 📊 Interpreting Results

### High Fraud Percentage?
- Could indicate data quality issues
- Check for unusual amounts in your data
- Review high-risk transactions manually
- Consider balance patterns

### All Transactions Low Risk?
- Your data may be all legitimate transactions
- Check if fraud patterns are present in data
- Verify required columns are correct
- Consider increasing sample size

### Mixed Results?
- Normal behavior - mix of safe and fraud
- Review fraud transactions for patterns
- Use charts to identify risk factors
- Export for further analysis

---

## 🔐 Privacy & Security

- ✅ Files are processed server-side
- ✅ Results are not stored permanently
- ✅ Data is validated before processing
- ✅ HTTPS recommended for sensitive data
- ✅ No data sent to external services

---

## 📞 Support

If you encounter issues:
1. Check this guide first
2. Review error messages carefully
3. Check backend logs for details
4. Try with sample data
5. Contact development team

---

## 🎓 Examples

### Example 1: E-commerce Fraud Detection
```
File: "online_sales_2024.csv"
Rows: 50,000 transactions
Result: 3.2% fraud rate (1,600 frauds)
Action: Review high-risk transactions
```

### Example 2: Bank Wire Fraud
```
File: "wire_transfers_daily.xlsx"
Rows: 10,000 transfers
Result: 0.8% fraud rate (80 frauds)
Action: Block flagged accounts
```

### Example 3: Card Transactions
```
File: "card_transactions.csv"
Rows: 100,000 swipes
Result: 5.1% fraud rate (5,100 frauds)
Action: Notify customers
```

---

## ✅ Checklist

- [ ] File has all required columns
- [ ] Column names are spelled correctly
- [ ] Data is in correct format (CSV/Excel)
- [ ] File is not corrupted
- [ ] Backend is running
- [ ] Frontend is loaded
- [ ] Browser console has no errors
- [ ] File size is reasonable

---

Happy analyzing! 🎉
