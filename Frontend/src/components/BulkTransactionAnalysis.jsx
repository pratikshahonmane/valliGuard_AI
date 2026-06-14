import React, { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import '../App.css';
import './BulkTransactionAnalysis.css';

const BulkTransactionAnalysis = ({ onFileSelect, onProcessing, loading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileData, setFileData] = useState(null);
  const [error, setError] = useState('');
  const [recordCount, setRecordCount] = useState(0);

  const REQUIRED_COLUMNS = [
    'step', 'type', 'amount', 'oldbalanceOrg',
    'newbalanceOrig', 'oldbalanceDest', 'newbalanceDest'
  ];

  const validateColumns = (data) => {
    if (!data || data.length === 0) {
      return { valid: false, error: 'File is empty' };
    }

    const headers = Object.keys(data[0]);
    const missing = REQUIRED_COLUMNS.filter(col => !headers.includes(col));

    if (missing.length > 0) {
      return {
        valid: false,
        error: `Invalid file format. Required columns are missing: ${missing.join(', ')}`
      };
    }

    return { valid: true };
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const parseFile = async (file) => {
    setError('');
    const ext = file.name.split('.').pop().toLowerCase();

    try {
      let jsonData = [];

      if (ext === 'csv') {
        // Parse CSV using Papa Parse
        return new Promise((resolve) => {
          Papa.parse(file, {
            header: true,
            complete: (results) => {
              jsonData = results.data.filter(row => Object.keys(row).some(key => row[key]));
              const validation = validateColumns(jsonData);
              if (!validation.valid) {
                setError(validation.error);
                resolve(null);
              } else {
                setFileData(jsonData);
                setRecordCount(jsonData.length);
                setFileName(file.name);
                onFileSelect(file, jsonData);
                resolve(jsonData);
              }
            },
            error: (error) => {
              setError(`Error parsing CSV: ${error.message}`);
              resolve(null);
            }
          });
        });
      } else if (ext === 'xlsx' || ext === 'xls') {
        // Parse Excel using XLSX
        const workbook = XLSX.read(new Uint8Array(await file.arrayBuffer()), {
          type: 'array'
        });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        jsonData = XLSX.utils.sheet_to_json(worksheet);

        const validation = validateColumns(jsonData);
        if (!validation.valid) {
          setError(validation.error);
          return null;
        }

        setFileData(jsonData);
        setRecordCount(jsonData.length);
        setFileName(file.name);
        onFileSelect(file, jsonData);
        return jsonData;
      } else {
        setError('Invalid file type. Please upload CSV or Excel file.');
        return null;
      }
    } catch (err) {
      setError(`Error processing file: ${err.message}`);
      return null;
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      parseFile(files[0]);
    }
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      parseFile(files[0]);
    }
  };

  const clearFile = () => {
    setFileName('');
    setFileData(null);
    setError('');
    setRecordCount(0);
  };

  return (
    <div className="glass-card bulk-upload-card">
      <h3 className="card-title">📁 Bulk Transaction Analysis</h3>

      {error && (
        <div className="error-box">
          <p className="error-text">⚠️ {error}</p>
        </div>
      )}

      <div
        className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="upload-content">
          <div className="upload-icon">📤</div>
          <p className="upload-text">
            Drag and drop your file here or click to browse
          </p>
          <p className="upload-subtext">Supports: CSV, XLSX, XLS</p>

          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileInput}
            className="file-input"
            id="bulk-file-input"
            disabled={loading}
          />
          <label htmlFor="bulk-file-input" className="file-input-label">
            Choose File
          </label>
        </div>
      </div>

      {fileName && (
        <div className="file-info">
          <div className="file-details">
            <p className="file-name">📄 {fileName}</p>
            <p className="record-count">
              Total Records: <span className="count-value">{recordCount}</span>
            </p>
          </div>
          <button
            className="clear-btn"
            onClick={clearFile}
            disabled={loading}
          >
            ✕
          </button>
        </div>
      )}

      <div className="required-columns">
        <p className="columns-label">Required Columns:</p>
        <div className="columns-list">
          {REQUIRED_COLUMNS.map((col) => (
            <span key={col} className="column-tag">
              {col}
            </span>
          ))}
        </div>
      </div>

      <button
        className="analyze-btn"
        onClick={() => onProcessing()}
        disabled={!fileData || loading}
      >
        {loading ? '⏳ Processing...' : '▶️ Run Bulk Prediction'}
      </button>
    </div>
  );
};

export default BulkTransactionAnalysis;
