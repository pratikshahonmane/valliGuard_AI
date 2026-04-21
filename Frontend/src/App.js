<<<<<<< HEAD
import React from 'react';
import './App.css';
import RiskAnalyzer from './pages/RiskAnalyzer';

const App = () => <RiskAnalyzer />;

export default App;
=======
import React, { useState } from 'react';
import { fieldMappings } from './mappings';
import './App.css';

const App = () => {
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);

  const initialFormState = {
    amount: "",
    transaction_type: 0,
    merchant: 0,
    city: 0,
    state: 0,
    country: 0,
    payment_method: 0,
    payment_channel: 0,
    device: 0,
    customer_age: "",
    customer_gender: 0,
    customer_income: "",
    account_balance: ""
  };

  const [formData, setFormData] = useState(initialFormState);

  const selectedCountryData = fieldMappings.countries[formData.country];

  const handleCountryChange = (e) => {
    setFormData({
      ...formData,
      country: parseInt(e.target.value),
      city: 0,
      state: 0
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPrediction(null);

    const featureArray = [
      formData.amount,
      formData.transaction_type,
      formData.merchant,
      formData.city,
      formData.state,
      formData.country,
      formData.payment_method,
      formData.payment_channel,
      formData.device,
      formData.customer_age,
      formData.customer_gender,
      formData.customer_income,
      formData.account_balance
    ].map(Number);

    try {
      const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features: featureArray }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Something went wrong");
      }

      setPrediction(data);

    } catch (err) {
      alert("Backend Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>🛡️ FraudGuard AI</h1>
        <p>Real-time Transaction Risk Analysis</p>
      </div>

      <form onSubmit={handleSubmit} className="fraud-form">

        {/* Numeric Fields */}
        {['amount', 'customer_age', 'customer_income', 'account_balance'].map(field => (
          <div className="input-group" key={field}>
            <label>{field.replace('_', ' ')}</label>
            <input
              type="number"
              value={formData[field]}
              onChange={(e) =>
                setFormData({ ...formData, [field]: e.target.value })
              }
              required
            />
          </div>
        ))}

        {/* Static Dropdowns */}
        {Object.keys(fieldMappings)
          .filter(k => k !== 'countries')
          .map(field => (
            <div className="input-group" key={field}>
              <label>{field.replace('_', ' ')}</label>
              <select
                value={formData[field]}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    [field]: parseInt(e.target.value)
                  })
                }
              >
                {fieldMappings[field].map((label, index) => (
                  <option key={label} value={index}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          ))}

        {/* Country */}
        <div className="input-group">
          <label>Country</label>
          <select value={formData.country} onChange={handleCountryChange}>
            {fieldMappings.countries.map((c, i) => (
              <option key={c.name} value={i}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* City */}
        <div className="input-group">
          <label>City</label>
          <select
            value={formData.city}
            onChange={(e) =>
              setFormData({ ...formData, city: parseInt(e.target.value) })
            }
          >
            {selectedCountryData.cities.map((city, i) => (
              <option key={city} value={i}>{city}</option>
            ))}
          </select>
        </div>

        {/* State */}
        <div className="input-group">
          <label>State</label>
          <select
            value={formData.state}
            onChange={(e) =>
              setFormData({ ...formData, state: parseInt(e.target.value) })
            }
          >
            {selectedCountryData.states.map((state, i) => (
              <option key={state} value={i}>{state}</option>
            ))}
          </select>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Analyzing..." : "Analyze Transaction"}
        </button>

        {/* RESULT */}
        {prediction && (
          <div
            className={`result-card ${
              prediction.prediction === 'Fraud'
                ? 'result-fraud'
                : 'result-legit'
            }`}
          >
            <h2>
              {prediction.prediction === 'Fraud'
                ? '⚠️ Fraud Detected'
                : '✅ Transaction Safe'}
            </h2>

            <p>
              Risk Score:{" "}
              <b>
                {(prediction.fraud_probability * 100).toFixed(2)}%
              </b>
            </p>
          </div>
        )}
      </form>
    </div>
  );
};

export default App;
>>>>>>> d58eaaed3b9d5c79945b14ab042ed3955b121e25
