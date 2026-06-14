import React, { useState } from 'react';
import axios from 'axios';
import ParameterForm from '../components/ParameterForm';
import PipelinePanel from '../components/PipelinePanel';
import { predictRisk, bulkPredictRisk } from '../services/api';
import RiskResultPanel from '../components/RiskResultPanel';
import BulkTransactionAnalysis from '../components/BulkTransactionAnalysis';
import BulkResultsPanel from '../components/BulkResultsPanel';
import '../App.css';
import './RiskAnalyzer.css';

const steps = [
  { title: 'Data Ingestion', desc: 'Receiving transaction data...', icon: '⬇️' },
  { title: 'Security Gateway', desc: 'Validating & authenticating...', icon: '🛡️' },
  { title: 'Data Processing', desc: 'Normalizing & extracting features...', icon: '⚙️' },
  { title: 'AI Risk Engine', desc: 'Analyzing risk patterns...', icon: '🧠' },
  { title: 'Result Generation', desc: 'Preparing explainable output...', icon: '✅' }
];

const bulkSteps = [
  { title: 'File Upload', desc: 'Reading uploaded file...', icon: '📁' },
  { title: 'CSV Conversion', desc: 'Converting to standard format...', icon: '📄' },
  { title: 'Data Validation', desc: 'Validating columns & data...', icon: '🔍' },
  { title: 'Feature Engineering', desc: 'Computing ML features...', icon: '⚙' },
  { title: 'SageMaker Prediction', desc: 'Running ML predictions...', icon: '🤖' },
  { title: 'Result Generation', desc: 'Generating reports...', icon: '📊' },
  { title: 'Download CSV', desc: 'Preparing download...', icon: '⬇' }
];

const defaultFormData = {
  amount: '',
  oldbalanceOrg: '',
  newbalanceOrig: '',
  oldbalanceDest: '',
  newbalanceDest: '',
  type: 'TRANSFER',
  step: '1'
};

const RiskAnalyzer = () => {
  // Single transaction state
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState(defaultFormData);

  // Bulk analysis state
  const [activeTab, setActiveTab] = useState('single');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkFileData, setBulkFileData] = useState(null);
  const [bulkResult, setBulkResult] = useState(null);
  const [bulkActiveStep, setBulkActiveStep] = useState(-1);
  const [bulkProgress, setBulkProgress] = useState(0);

  const handleAnalyze = async () => {
    if (!formData.amount || !formData.oldbalanceOrg || !formData.step) {
      alert('Please enter the Step, Amount, and Sender Old Balance.');
      return;
    }

    setLoading(true);
    setResult(null);

    for (let i = 0; i < steps.length; i += 1) {
      setActiveStep(i);
      // Maintain the same animated pipeline behavior.
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, 400));
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

      const data = await predictRisk(payload);

      setResult({
        prediction: data.prediction,
        confidence: data.confidence,
        score: Math.round(data.fraud_probability * 100),
        level: data.risk_level?.toUpperCase(),
        explanation: data.explanation || []
      });
    } catch (error) {
      setResult({
        score: 0,
        level: 'ERROR',
        explanation: ['Could not reach the Risk Engine. Verify FastAPI is running on port 8001.']
      });
    } finally {
      setLoading(false);
      setActiveStep(-1);
    }
  };

  const handleBulkFileSelect = (file, fileData) => {
    setBulkFile(file);
    setBulkFileData(fileData);
  };

  const handleBulkProcessing = async () => {
    if (!bulkFile) {
      alert('Please select a file first');
      return;
    }

    setBulkLoading(true);
    setBulkResult(null);
    setBulkProgress(0);

    try {
      // Simulate pipeline animation
      for (let i = 0; i < bulkSteps.length; i += 1) {
        setBulkActiveStep(i);
        const stepProgress = Math.round(((i + 1) / bulkSteps.length) * 100);
        setBulkProgress(stepProgress);
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => setTimeout(resolve, 600));
      }

      // Call backend API with file
      const data = await bulkPredictRisk(bulkFile);

      setBulkResult(data);
      setBulkProgress(100);
    } catch (error) {
      console.error('Bulk prediction error:', error);
      alert(
        `Error: ${error.response?.data?.detail || error.message || 'Unknown error occurred'}`
      );
      setBulkProgress(0);
    } finally {
      setBulkLoading(false);
      setBulkActiveStep(-1);
    }
  };

  const getRiskColor = () => {
    if (!result || result.level === 'ERROR') return '#233060';
    if (result.score > 70) return '#ff4d4d';
    if (result.score > 30) return '#ff9a44';
    return '#00ff88';
  };

  const getDynamicExplanation = (score) => {
    if (score === undefined || score === null) return ['Awaiting analysis...'];
    if (score > 70) return [
      'High transaction amount detected',
      'Unusual balance change observed',
      'Pattern matches fraud behavior',
      'High-risk transaction type',
      'Immediate attention required'
    ];
    if (score > 30) return [
      'Moderate transaction amount',
      'Some irregular balance movement',
      'Suspicious pattern detected',
      'Needs manual review',
      'Potential risk factors present'
    ];
    return [
      'Transaction within normal range',
      'No unusual balance change',
      'Behavior looks normal',
      'Low-risk transaction',
      'No immediate concerns'
    ];
  };

  return (
    <div className="app-shell">
      <h2 className="risk-analyzer-header">
        <span className="risk-analyzer-title">🛡️ ValliGuard AI</span>
        <span className="risk-analyzer-subtitle">Real-time Fraud Audit</span>
      </h2>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'single' ? 'active' : ''}`}
          onClick={() => setActiveTab('single')}
        >
          🔍 Single Transaction
        </button>
        <button
          className={`tab-btn ${activeTab === 'bulk' ? 'active' : ''}`}
          onClick={() => setActiveTab('bulk')}
        >
          📊 Bulk Analysis
        </button>
      </div>

      {/* Single Transaction Tab */}
      {activeTab === 'single' && (
        <div className="dashboard-grid">
          <ParameterForm
            formData={formData}
            setFormData={setFormData}
            onAnalyze={handleAnalyze}
            loading={loading}
          />
          <PipelinePanel steps={steps} activeStep={activeStep} />
          <RiskResultPanel
            result={result}
            formData={formData}
            getRiskColor={getRiskColor}
            getDynamicExplanation={getDynamicExplanation}
          />
        </div>
      )}

      {/* Bulk Analysis Tab */}
      {activeTab === 'bulk' && (
        <div className="bulk-dashboard-grid">
          <BulkTransactionAnalysis
            onFileSelect={handleBulkFileSelect}
            onProcessing={handleBulkProcessing}
            loading={bulkLoading}
          />
          <PipelinePanel steps={bulkSteps} activeStep={bulkActiveStep} />

          {/* Progress Bar */}
          {bulkLoading && (
            <div className="progress-section">
              <div className="progress-header">
                <h4>Processing {bulkFileData?.length || 0} Transactions</h4>
                <span className="progress-percentage">{bulkProgress}%</span>
              </div>
              <div className="progress-bar-container">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${bulkProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Results */}
          {bulkResult && (
            <BulkResultsPanel
              results={bulkResult}
              loading={bulkLoading}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default RiskAnalyzer;
