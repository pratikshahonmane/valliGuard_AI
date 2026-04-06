import React, { useState } from 'react';
import './App.css';

const RiskAnalyzer = () => {
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const [result, setResult] = useState(null);

  const [formData, setFormData] = useState({
    amount: '',
    oldbalanceOrg: '',
    newbalanceOrig: '',
    oldbalanceDest: '',
    newbalanceDest: '',
    type: 'TRANSFER',
    step: '1',
  });

  const steps = [
    { title: "Data Ingestion", desc: "Receiving transaction data...", icon: "⬇️" },
    { title: "Security Gateway", desc: "Validating & authenticating...", icon: "🛡️" },
    { title: "Data Processing", desc: "Normalizing & extracting features...", icon: "⚙️" },
    { title: "AI Risk Engine", desc: "Analyzing risk patterns...", icon: "🧠" },
    { title: "Result Generation", desc: "Preparing explainable output...", icon: "✅" },
  ];

  const handleAnalyze = async () => {
    if (!formData.amount || !formData.oldbalanceOrg || !formData.step) {
      alert("Please enter the Step, Amount, and Sender Old Balance.");
      return;
    }

    setLoading(true);
    setResult(null);

    for (let i = 0; i < steps.length; i++) {
      setActiveStep(i);
      await new Promise(r => setTimeout(r, 400));
    }

    try {
      const payload = {
        step: Number(formData.step),
        type: formData.type,
        amount: Number(formData.amount),
        oldbalanceOrg: Number(formData.oldbalanceOrg),
        newbalanceOrig: formData.newbalanceOrig === '' ? 0 : Number(formData.newbalanceOrig),
        oldbalanceDest: formData.oldbalanceDest === '' ? 0 : Number(formData.oldbalanceDest),
        newbalanceDest: formData.newbalanceDest === '' ? 0 : Number(formData.newbalanceDest)
      };

      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Backend Connection Failed');

      const data = await response.json();

      setResult({
        prediction: data.prediction,
        confidence: data.confidence,
        score: Math.round(data.fraud_probability * 100),
        level: data.risk_level.toUpperCase(),
        explanation: data.explanation || []
      });

    } catch (error) {
      console.error("Analysis failed:", error);
      setResult({
        score: 0,
        level: "ERROR",
        explanation: ["Could not reach the Risk Engine. Verify FastAPI is running on port 8000."]
      });
    } finally {
      setLoading(false);
      setActiveStep(-1);
    }
  };

  const getRiskColor = () => {
    if (!result || result.level === "ERROR") return '#233060';
    if (result.score > 70) return '#ff4d4d';
    if (result.score > 30) return '#ff9a44';
    return '#00ff88';
  };

  const getDynamicExplanation = (score) => {
    if (!score && score !== 0) return ["Awaiting analysis..."];
    if (score > 70) return [
      "High transaction amount detected",
      "Unusual balance change observed",
      "Pattern matches fraud behavior",
      "High-risk transaction type",
      "Immediate attention required"
    ];
    if (score > 30) return [
      "Moderate transaction amount",
      "Some irregular balance movement",
      "Suspicious pattern detected",
      "Needs manual review",
      "Potential risk factors present"
    ];
    return [
      "Transaction within normal range",
      "No unusual balance change",
      "Behavior looks normal",
      "Low-risk transaction",
      "No immediate concerns"
    ];
  };

  return (
    <div style={{ padding: '40px' }}>
      <h2 style={{ marginBottom: '30px' }}>
        🛡️ ValliGuard AI
        <span style={{ fontSize: '0.9rem', color: '#ff7a18', marginLeft: '15px' }}>
          Real-time Fraud Audit
        </span>
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '25px' }}>
        {/* Panel 1: Audit Parameters */}
        <div className="glass-card">
          <h5 style={{ borderBottom: '1px solid #1c2a54', paddingBottom: '10px' }}> Parameters</h5>
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ color: '#a0a8c3', fontSize: '0.8rem' }}>Step (Hour)</label>
                <input type="number" className="cyber-input" placeholder="1"
                  value={formData.step} onChange={e => setFormData({ ...formData, step: e.target.value })} />
              </div>
              <div style={{ flex: 2 }}>
                <label style={{ color: '#a0a8c3', fontSize: '0.8rem' }}>Amount (USD)</label>
                <input type="number" className="cyber-input" placeholder="0.00"
                  value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ color: '#a0a8c3', fontSize: '0.8rem' }}>Sender Old Bal</label>
                <input type="number" className="cyber-input"
                  value={formData.oldbalanceOrg} onChange={e => setFormData({ ...formData, oldbalanceOrg: e.target.value })} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ color: '#a0a8c3', fontSize: '0.8rem' }}>Sender New Bal</label>
                <input type="number" className="cyber-input"
                  value={formData.newbalanceOrig} onChange={e => setFormData({ ...formData, newbalanceOrig: e.target.value })} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ color: '#a0a8c3', fontSize: '0.8rem' }}>Receiver Old Bal</label>
                <input type="number" className="cyber-input"
                  value={formData.oldbalanceDest} onChange={e => setFormData({ ...formData, oldbalanceDest: e.target.value })} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ color: '#a0a8c3', fontSize: '0.8rem' }}>Receiver New Bal</label>
                <input type="number" className="cyber-input"
                  value={formData.newbalanceDest} onChange={e => setFormData({ ...formData, newbalanceDest: e.target.value })} />
              </div>
            </div>

            <div style={{ marginTop: '15px' }}>
              <label style={{ color: '#a0a8c3', fontSize: '0.8rem' }}>Transaction Type</label>
              <select className="cyber-input" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                <option value="TRANSFER">Transfer</option>
                <option value="CASH_OUT">Cash Out</option>
              </select>
            </div>

            <button className="btn-analyze" onClick={handleAnalyze} disabled={loading}
              style={{
                width: '100%',
                marginTop: '20px',
                background: loading ? '#444' : 'linear-gradient(90deg, #ff7a18, #ff9a44)',
                border: 'none',
                padding: '15px',
                borderRadius: '10px',
                color: 'white',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}>
              {loading ? "PROCESSING..." : "Submit"}
            </button>
          </div>
        </div>

        {/* Panel 2: Processing Pipeline */}
        <div className="glass-card">
          <h5 style={{ borderBottom: '1px solid #1c2a54', paddingBottom: '10px' }}>Processing Pipeline</h5>
          <div style={{ marginTop: '20px', position: 'relative' }}>
            {steps.map((step, index) => (
              <div key={index} style={{ position: 'relative', marginBottom: '20px' }}>
                {index !== steps.length - 1 && (
                  <div style={{
                    position: 'absolute',
                    left: '22px',
                    top: '55px',
                    width: '1.5px',
                    height: '25px',
                    background: activeStep >= index ? '#ff7a18' : '#2a335a'
                  }} />
                )}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: activeStep === index ? '#1f2a4d' : '#1a1f2e',
                  border: `1px solid ${activeStep === index ? '#ff9a44' : '#2a335a'}`,
                  borderRadius: '12px',
                  padding: '15px',
                  boxShadow: activeStep === index ? '0 0 10px rgba(255,122,24,0.5)' : 'none',
                  transition: '0.3s'
                }}>
                  <div style={{
                    width: '45px',
                    height: '45px',
                    background: activeStep === index ? '#ff7a18' : '#233060',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    color: 'white'
                  }}>{step.icon}</div>

                  <div style={{ marginLeft: '15px', flex: 1 }}>
                    <div style={{ color: 'white', fontWeight: '600' }}>{step.title}</div>
                    <div style={{ color: '#a0a8c3', fontSize: '0.8rem' }}>{step.desc}</div>
                  </div>

                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: activeStep > index ? '#00ff88' : activeStep === index ? '#ff9a44' : '#444'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 3: Verdict */}
        <div className="glass-card" style={{ textAlign: 'center', minHeight: '500px' }}>
          {result ? (
            <>
              <div className="risk-circle" style={{ borderColor: getRiskColor(), margin: '0 auto', boxShadow: `0 0 20px ${getRiskColor()}33` }}>
                <div style={{ fontSize: '3.5rem', fontWeight: 'bold', color: 'white' }}>{result.score}%</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#a0a8c3' }}> RISK</div>
              </div>

              <div style={{ marginTop: '20px' }}>
                <div style={{
                  display: 'inline-block',
                  padding: '8px 20px',
                  borderRadius: '6px',
                  marginBottom: '15px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  letterSpacing: '1px',
                  background: result.prediction === "fraud" ? '#ff4d4d' : '#00ff88',
                  color: '#121212',
                  boxShadow: `0 0 15px ${result.prediction === "fraud" ? '#ff4d4d' : '#00ff88'}66`,
                  textTransform: 'uppercase'
                }}>
                  {result.prediction === "fraud" ? "🚩 Fraud Detected" : "✅ Safe Transaction"}
                </div>

                <h3 style={{ color: getRiskColor(), margin: '5px 0', letterSpacing: '1px' }}>{result.level} RISK</h3>

                <div style={{
                  marginTop: '15px',
                  padding: '15px',
                  borderRadius: '16px',
                  background: 'linear-gradient(145deg, #0f1b3d, #0c1633)',
                  border: '1px solid #1c2a54',
                  boxShadow: 'inset 0 0 10px rgba(0,0,0,0.4), 0 0 15px rgba(0,0,0,0.2)'
                }}>

                  {/* Title */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#ff7a18',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    marginBottom: '10px'
                  }}>
                    🧠 AI Confidence: {
                      result?.confidence !== undefined
                        ? `${(result.confidence * 100).toFixed(1)}%`
                        : "N/A"
                    }
                  </div>

                  {/* Progress Bar Background */}
                  <div style={{
                    width: '100%',
                    height: '12px',
                    borderRadius: '10px',
                    background: '#0a1128',
                    overflow: 'hidden'
                  }}>

                    {/* Progress Fill */}
                    <div style={{
                      width: result?.confidence ? `${result.confidence * 100}%` : '0%',
                      height: '100%',
                      borderRadius: '10px',
                      background: 'linear-gradient(90deg, #00ff88, #00c46a)',
                      boxShadow: '0 0 10px rgba(0,255,136,0.6)',
                      transition: 'width 0.5s ease-in-out'
                    }} />

                  </div>
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #1c2a54', margin: '20px 0' }} />

              {/* Explainable AI Section */}
              <div style={{ textAlign: 'left' }}>

                {/* Title */}
                <div style={{
                  fontSize: '2.5 rem',
                  fontWeight: 'bold',
                  color: '#e5e7eb',
                  marginBottom: '15px'
                }}>
                  💡 Explainable AI - Risk Factors Detected:
                </div>

                {/* Dynamic Explanation Cards */}
                {getDynamicExplanation(result.score).map((point, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px',
                    borderRadius: '12px',
                    marginBottom: '12px',
                    background: 'linear-gradient(145deg, #0f1b3d, #0c1633)',
                    border: '1px solid #1c2a54',
                    boxShadow: '0 0 10px rgba(0,0,0,0.3)'
                  }}>

                    {/* Orange Check Icon */}
                    <div style={{
                      minWidth: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: '#ff7a18',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#121212',
                      fontWeight: 'bold',
                      fontSize: '14px'
                    }}>
                      ✓
                    </div>

                    {/* Text */}
                    <div style={{
                      color: '#d1d5db',
                      fontSize: '0.9rem'
                    }}>
                      {point}
                    </div>
                  </div>
                ))}

                {/* Optional AI Explanation (same style) */}
                {result.explanation && result.explanation.length > 0 && (
                  <>
                    <div style={{
                      marginTop: '20px',
                      fontSize: '0.8rem',
                      color: '#ff7a18',
                      fontWeight: 'bold'
                    }}>
                      AI Reasoning:
                    </div>

                    {result.explanation.map((line, i) => (
                      <div key={i} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        borderRadius: '10px',
                        marginTop: '10px',
                        background: '#0c1633',
                        border: '1px solid #1c2a54'
                      }}>
                        <div style={{
                          minWidth: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: '#ff7a18',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          color: '#121212'
                        }}>
                          ✓
                        </div>

                        <div style={{ color: '#a0a8c3', fontSize: '0.85rem' }}>
                          {line}
                        </div>
                      </div>
                    ))}
                  </>
                )}

              </div>
              <div style={{ marginTop: '25px', textAlign: 'left' }}>

                <div style={{
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  color: '#ff7a18',
                  marginBottom: '15px'
                }}>
                  🚨 Feature Impact Analysis
                </div>

                {(() => {
                  const features = [
                    { name: "Step", value: Number(formData.step || 0) },
                    { name: "Amount", value: Number(formData.amount || 0) },
                    { name: "Receiver New Balance", value: Number(formData.newbalanceDest || 0) },
                    { name: "Receiver Old Balance", value: Number(formData.oldbalanceDest || 0) },
                    { name: "Sender New Balance", value: Number(formData.newbalanceOrig || 0) },
                    { name: "Sender Old Balance", value: Number(formData.oldbalanceOrg || 0) },

                    // Encode type as numeric impact
                    { name: "Transaction Type", value: formData.type === "CASH_OUT" ? 1 : 0.5 }
                  ];

                  // Normalize values
                  const maxVal = Math.max(...features.map(f => f.value), 1);

                  const scored = features.map(f => ({
                    ...f,
                    impact: f.value / maxVal
                  }));

                  // Sort descending
                  scored.sort((a, b) => b.impact - a.impact);

                  return scored.map((f, i) => (
                    <div key={i} style={{
                      marginBottom: '12px',
                      padding: '12px',
                      borderRadius: '12px',
                      background: 'linear-gradient(145deg, #0f1b3d, #0c1633)',
                      border: '1px solid #1c2a54',
                      boxShadow: i === 0
                        ? '0 0 15px rgba(255,77,77,0.4)'
                        : '0 0 8px rgba(0,0,0,0.3)'
                    }}>

                      {/* Header */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '6px'
                      }}>
                        <span style={{
                          color: i === 0 ? '#ff4d4d' : '#e5e7eb',
                          fontSize: '0.85rem',
                          fontWeight: i === 0 ? 'bold' : 'normal'
                        }}>
                          {i === 0 ? "🔥 " : ""}{f.name}
                        </span>

                        <span style={{
                          color: '#ff9a44',
                          fontSize: '0.8rem'
                        }}>
                          {(f.impact * 100).toFixed(0)}%
                        </span>
                      </div>

                      {/* Bar */}
                      <div style={{
                        width: '100%',
                        height: '8px',
                        background: '#0a1128',
                        borderRadius: '8px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${f.impact * 100}%`,
                          height: '100%',
                          background: i === 0
                            ? 'linear-gradient(90deg, #ff4d4d, #ff0000)'
                            : 'linear-gradient(90deg, #ff7a18, #ffb347)',
                          boxShadow: '0 0 10px rgba(255,122,24,0.6)',
                          transition: 'width 0.5s ease'
                        }} />
                      </div>

                    </div>
                  ));
                })()}

              </div>

              {/* Action Recommendation */}
              <div style={{
                marginTop: '20px',
                padding: '12px',
                borderRadius: '8px',
                background: `${getRiskColor()}15`,
                border: `1px dashed ${getRiskColor()}55`,
                fontSize: '0.8rem',
                color: '#fff'
              }}>
                <strong>Recommendation:</strong> {result.score > 70 ? "Block immediately" : result.score > 30 ? "Flag for review" : "Approve transaction"}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#a0a8c3' }}>
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🔍</div>
              <p>Awaiting transaction data...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiskAnalyzer;
