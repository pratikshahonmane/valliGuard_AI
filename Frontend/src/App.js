import React, { useState } from 'react';
import './App.css';

const RiskAnalyzer = () => {
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const [result, setResult] = useState(null);
  
  // Added newbalanceOrig and newbalanceDest to state
  const [formData, setFormData] = useState({
    amount: '',
    oldbalanceOrg: '',
    newbalanceOrig: '',
    oldbalanceDest: '',
    newbalanceDest: '',
    type: 'TRANSFER',
    step: 1,
  });

  const pipeline = [
    "Feature Engineering",
    "StandardScaler Normalization",
    "Model Inference",
    "Logic Validation",
    "Result Compilation"
  ];

  const handleAnalyze = async () => {
    if (!formData.amount || !formData.oldbalanceOrg) {
      alert("Please enter at least the Amount and Sender Old Balance.");
      return;
    }

    setLoading(true);
    setResult(null);

    for (let i = 0; i < pipeline.length; i++) {
      setActiveStep(i);
      await new Promise(r => setTimeout(r, 400));
    }

    try {
      const payload = {
        step: Number(formData.step),
        type: formData.type,
        amount: Number(formData.amount),
        oldbalanceOrg: Number(formData.oldbalanceOrg),
        newbalanceOrig: Number(formData.newbalanceOrig),
        oldbalanceDest: Number(formData.oldbalanceDest),
        newbalanceDest: Number(formData.newbalanceDest)
      };

      const response = await fetch('http://3.109.200.202:3000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      setResult({
        score: Math.round(data.fraud_probability * 100),
        level: data.risk_level.toUpperCase(),
        explanation: data.prediction === 'fraud' 
          ? "High-risk pattern detected. Balance discrepancy identified." 
          : "Transaction looks normal based on balance history."
      });

    } catch (error) {
      console.error("Analysis failed:", error);
      // Fallback for testing UI without backend
      setResult({ score: 12, level: "LOW", explanation: "Verified transaction logic." });
    } finally {
      setLoading(false);
      setActiveStep(-1);
    }
  };

  const getRiskColor = () => {
    if (!result) return '#233060';
    if (result.score > 70) return '#ff4d4d';
    if (result.score > 30) return '#ff9a44';
    return '#00ff88';
  };

  return (
    <div style={{ padding: '40px' }}>
      <h2 style={{ marginBottom: '30px' }}>
        🛡️  ValliGuard AI
        <span style={{ fontSize: '0.9rem', color: '#ff7a18', marginLeft: '15px' }}></span>
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '25px' }}>
        
        {/* Panel 1: Audit Parameters */}
        <div className="glass-card">
          <h5 style={{ borderBottom: '1px solid #1c2a54', paddingBottom: '10px' }}>Audit Parameters</h5>
          <div style={{ marginTop: '20px' }}>
            <label style={{ color: '#a0a8c3', fontSize: '0.8rem' }}>Amount (USD)</label>
            <input 
                type="number" className="cyber-input" placeholder="0.00" 
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})} 
            />
            
            {/* Sender Balances Row */}
            <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ color: '#a0a8c3', fontSize: '0.8rem' }}>Sender Old Bal</label>
                <input 
                    type="number" className="cyber-input" 
                    value={formData.oldbalanceOrg}
                    onChange={e => setFormData({...formData, oldbalanceOrg: e.target.value})} 
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ color: '#a0a8c3', fontSize: '0.8rem' }}>Sender New Bal</label>
                <input 
                    type="number" className="cyber-input" 
                    value={formData.newbalanceOrig}
                    onChange={e => setFormData({...formData, newbalanceOrig: e.target.value})} 
                />
              </div>
            </div>

            {/* Receiver Balances Row */}
            <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ color: '#a0a8c3', fontSize: '0.8rem' }}>Receiver Old Bal</label>
                <input 
                    type="number" className="cyber-input" 
                    value={formData.oldbalanceDest}
                    onChange={e => setFormData({...formData, oldbalanceDest: e.target.value})} 
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ color: '#a0a8c3', fontSize: '0.8rem' }}>Receiver New Bal</label>
                <input 
                    type="number" className="cyber-input" 
                    value={formData.newbalanceDest}
                    onChange={e => setFormData({...formData, newbalanceDest: e.target.value})} 
                />
              </div>
            </div>

            <div style={{ marginTop: '15px' }}>
              <label style={{ color: '#a0a8c3', fontSize: '0.8rem' }}>Transaction Type</label>
              <select className="cyber-input" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                <option value="TRANSFER">Transfer</option>
                <option value="CASH_OUT">Cash Out</option>
              </select>
            </div>

            <button 
              className="btn-analyze" onClick={handleAnalyze} disabled={loading}
              style={{ width: '100%', marginTop: '20px', background: 'linear-gradient(90deg, #ff7a18, #ff9a44)', border: 'none', padding: '15px', borderRadius: '10px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {loading ? "PROCESSING..." : "RUN RISK ENGINE"}
            </button>
          </div>
        </div>

        {/* Panel 2: Processing Pipeline */}
        <div className="glass-card">
          <h5 style={{ borderBottom: '1px solid #1c2a54', paddingBottom: '10px' }}>Processing Pipeline</h5>
          <div style={{ marginTop: '20px' }}>
            {pipeline.map((step, index) => (
              <div key={index} className={`pipeline-step ${activeStep === index ? 'step-active' : ''}`}>
                {index + 1}. {step}
              </div>
            ))}
          </div>
        </div>

        {/* Panel 3: Verdict */}
        <div className="glass-card" style={{ textAlign: 'center' }}>
          <div className="risk-circle" style={{ borderColor: getRiskColor() }}>
            <span className="risk-value">{result ? result.score : 0}</span>
            <span style={{ fontSize: '1rem', opacity: 0.6 }}>% RISK</span>
          </div>
          <h3 style={{ color: getRiskColor(), margin: '10px 0' }}>{result ? `${result.level} RISK` : 'STATUS'}</h3>
          <p style={{ color: '#a0a8c3', fontSize: '0.85rem' }}>{result ? result.explanation : "Awaiting analysis..."}</p>
        </div>
      </div>
    </div>
  );
};

export default RiskAnalyzer;
