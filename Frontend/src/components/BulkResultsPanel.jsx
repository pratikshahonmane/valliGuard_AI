import React, { useState } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import '../App.css';
import './BulkResultsPanel.css';

const BulkResultsPanel = ({ results, loading }) => {
  const [downloadFormat, setDownloadFormat] = useState('csv');

  if (!results) {
    return null;
  }

  const {
    total = 0,
    fraud_count = 0,
    safe_count = 0,
    fraud_percentage = 0,
    results: predictions = []
  } = results;

  // Prepare data for Fraud vs Safe pie chart
  const fraudVsSafeData = [
    { name: 'Safe', value: safe_count, fill: '#00ff88' },
    { name: 'Fraud', value: fraud_count, fill: '#ff4d4d' }
  ];

  // Prepare data for Risk Score Distribution (histogram)
  const riskDistribution = {};
  predictions.forEach(pred => {
    const risk = pred.risk_level || 'unknown';
    riskDistribution[risk] = (riskDistribution[risk] || 0) + 1;
  });

  const riskDistributionData = Object.entries(riskDistribution).map(([level, count]) => ({
    level: level.charAt(0).toUpperCase() + level.slice(1),
    count
  }));

  // Prepare data for Transaction Type Analysis
  const typeAnalysis = {};
  predictions.forEach(pred => {
    const type = pred.type || 'unknown';
    if (!typeAnalysis[type]) {
      typeAnalysis[type] = { count: 0, fraud: 0 };
    }
    typeAnalysis[type].count += 1;
    if (pred.prediction === 'fraud') {
      typeAnalysis[type].fraud += 1;
    }
  });

  const transactionTypeData = Object.entries(typeAnalysis).map(([type, data]) => ({
    type,
    count: data.count,
    fraud: data.fraud
  }));

  // Download functions
  const downloadCSV = () => {
    const headers = [
      'step', 'type', 'amount', 'oldbalanceOrg', 'newbalanceOrig',
      'oldbalanceDest', 'newbalanceDest', 'prediction', 'fraud_probability',
      'risk_score', 'risk_level'
    ];

    const rows = predictions.map(pred => [
      pred.step,
      pred.type,
      pred.amount,
      pred.oldbalanceOrg,
      pred.newbalanceOrig,
      pred.oldbalanceDest,
      pred.newbalanceDest,
      pred.prediction,
      pred.fraud_probability,
      pred.risk_score,
      pred.risk_level
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent)
    );
    element.setAttribute('download', 'prediction_result.csv');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const downloadExcel = () => {
    // For Excel, we'll create a simple CSV that Excel can open
    downloadCSV(); // Using CSV format for simplicity
  };

  const exportJSON = () => {
    const dataStr = JSON.stringify(results, null, 2);
    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
    );
    element.setAttribute('download', 'prediction_result.json');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="bulk-results-container">
      <h3 className="results-title">📊 Bulk Prediction Results</h3>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-value">{total}</div>
          <div className="card-label">Total Transactions</div>
        </div>
        <div className="summary-card fraud">
          <div className="card-value">{fraud_count}</div>
          <div className="card-label">Fraud Transactions</div>
        </div>
        <div className="summary-card safe">
          <div className="card-value">{safe_count}</div>
          <div className="card-label">Safe Transactions</div>
        </div>
        <div className="summary-card">
          <div className="card-value">{fraud_percentage}%</div>
          <div className="card-label">Fraud Percentage</div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {/* Fraud vs Safe Pie Chart */}
        <div className="chart-card">
          <h4 className="chart-title">Fraud vs Safe Distribution</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={fraudVsSafeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {fraudVsSafeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Level Distribution */}
        <div className="chart-card">
          <h4 className="chart-title">Risk Score Distribution</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={riskDistributionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#233060" />
              <XAxis dataKey="level" stroke="var(--text-muted)" />
              <YAxis stroke="var(--text-muted)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#121c3b',
                  border: '1px solid #233060'
                }}
              />
              <Bar dataKey="count" fill="var(--accent-orange)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Transaction Type Analysis */}
        {transactionTypeData.length > 0 && (
          <div className="chart-card">
            <h4 className="chart-title">Transaction Type Analysis</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={transactionTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#233060" />
                <XAxis dataKey="type" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#121c3b',
                    border: '1px solid #233060'
                  }}
                />
                <Legend />
                <Bar dataKey="count" fill="var(--accent-orange)" name="Total" />
                <Bar dataKey="fraud" fill="var(--accent-red)" name="Fraud" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Download Options */}
      <div className="download-section">
        <h4 className="download-title">📥 Download Results</h4>
        <div className="download-buttons">
          <button className="download-btn csv" onClick={downloadCSV}>
            📄 Download CSV
          </button>
          <button className="download-btn json" onClick={exportJSON}>
            📋 Download JSON
          </button>
          <button className="download-btn excel" onClick={downloadExcel}>
            🗂️ Download Excel
          </button>
        </div>
      </div>

      {/* Results Table */}
      <div className="results-table-container">
        <h4 className="table-title">📋 Detailed Results</h4>
        <div className="table-scroll">
          <table className="results-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Prediction</th>
                <th>Risk Score %</th>
                <th>Risk Level</th>
              </tr>
            </thead>
            <tbody>
              {predictions.slice(0, 20).map((pred, idx) => (
                <tr key={idx} className={`row-${pred.prediction}`}>
                  <td>{idx + 1}</td>
                  <td>{pred.type}</td>
                  <td>${pred.amount.toFixed(2)}</td>
                  <td>
                    <span className={`prediction-badge ${pred.prediction}`}>
                      {pred.prediction.toUpperCase()}
                    </span>
                  </td>
                  <td>{pred.risk_score}</td>
                  <td>
                    <span className={`risk-level-badge ${pred.risk_level}`}>
                      {pred.risk_level.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {predictions.length > 20 && (
          <p className="table-note">Showing first 20 of {predictions.length} results...</p>
        )}
      </div>
    </div>
  );
};

export default BulkResultsPanel;
