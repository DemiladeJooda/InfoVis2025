import React, { useState, useEffect, useContext } from 'react';
import Plot from 'react-plotly.js';
import './Dashboard.css';
import { CsvContext } from './CsvContext';
import { useNavigate } from 'react-router-dom';

function Multiview() {
  const { csvFile } = useContext(CsvContext);
  const [plots, setPlots] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); 

  const [selectedParamForComparison, setSelectedParamForComparison] = useState('Nitrate');
  const [paramOptions, setParamOptions] = useState([
    'Ph', 'Temperature', 'DissolvedOxygen', 'Conductivity',
    'BiologicalOxygenDemand', 'TotalSuspendedSolids',
    'EColi', 'Ammonia', 'Nitrate'
  ]);

  const [selectedParamForThreshold, setSelectedParamForThreshold] = useState('EColi');

  
  const fetchThresholdAnalysis = (param) => {
    const formData = new FormData();
    formData.append('csv_file', csvFile);
    formData.append('vis_type', 'threshold_analysis');
    formData.append('parameter', param);
  
    fetch('http://localhost:5050/api/visualize', {
      method: 'POST',
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPlots(prev => ({
            ...prev,
            thresholdOverlay: JSON.parse(data.plotlyData)
          }));
        } else {
          alert(data.error);
        }
      })
      .catch(err => alert('Fetch failed: ' + err.message));
  };

  
  const fetchPollutantComparison = (param) => {
    const formData = new FormData();
    formData.append('csv_file', csvFile);
    formData.append('vis_type', 'location_comparison');
    formData.append('parameter', param);

    fetch('http://localhost:5050/api/visualize', {
      method: 'POST',
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPlots(prev => ({
            ...prev,
            pollutantComparison: JSON.parse(data.plotlyData)
          }));
        } else {
          alert(data.error);
        }
      })
      .catch(err => alert('Fetch failed: ' + err.message));
  };

  
  useEffect(() => {
    if (csvFile) fetchPollutantComparison(selectedParamForComparison);
  }, [selectedParamForComparison, csvFile]);
  
  useEffect(() => {
    if (csvFile) fetchThresholdAnalysis(selectedParamForThreshold);
  }, [selectedParamForThreshold, csvFile]);
  
  useEffect(() => {
    if (!csvFile) {
      alert('Please upload a dataset on the Dashboard first.');
      return;
    }
  
    const formData = new FormData();
    formData.append('csv_file', csvFile);
    formData.append('vis_type', 'multiview');
  
    setLoading(true);
    fetch('http://localhost:5050/api/visualize-multiview', {
      method: 'POST',
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const parsedData = data.plotlyData;
          setPlots(parsedData);
        } else {
          alert(data.error);
        }
      })
      .catch(err => alert('Failed to fetch: ' + err.message))
      .finally(() => setLoading(false));
  }, [csvFile]);
  


























  return (
    <div className="dashboard-container">
      <h1>Multiview Water Quality Analysis</h1>

      <button className="reset-button" onClick={() => navigate('/dashboard')}>
        ← Back to Dashboard
      </button>

      {loading && <p>Loading visualizations...</p>}

      {/* {!loading && plots.metricIndex && (
        <div className="dashboard-card">
          <h3>📊 Parameter Contribution to Water Quality Index</h3>
          <Plot
            data={plots.metricIndex.data}
            layout={plots.metricIndex.layout}
            config={{ responsive: true }}
          />
        </div>
      )} */}

      {!loading && plots.pollutantComparison && (
        <div className="dashboard-card">
          <h3>⚖️ Pollutant Comparison Across Locations</h3>
          <div className="control-group" style={{ marginBottom: '1rem' }}>
            <label>Parameter: </label>
            <select
              value={selectedParamForComparison}
              onChange={(e) => {
                const newParam = e.target.value;
                setSelectedParamForComparison(newParam);
                fetchPollutantComparison(newParam);
              }}
            >
              {paramOptions.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <Plot
            data={plots.pollutantComparison.data}
            layout={plots.pollutantComparison.layout}
            config={{ responsive: true }}
          />
        </div>
      )}
      










      {!loading && plots.thresholdOverlay && (
       <div className="dashboard-card">
       <h3>🚦 Threshold Overlay Analysis</h3>
       <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
  
       <div className="threshold-controls">
        
        
        <label>Parameter: </label>
  <select
    value={selectedParamForThreshold}
    onChange={(e) => {
      const newParam = e.target.value;
      setSelectedParamForThreshold(newParam);
      fetchThresholdAnalysis(newParam);
    }}
    style={{ marginRight: '1rem' }}
  >
    {paramOptions.map(p => (
      <option key={p} value={p}>{p}</option>
    ))}
  </select>

  <button
    onClick={() => alert(`
⚠️ Threshold Guide

- pH: 6.5–8.5 (EPA)
- Temp: <32°C
- Dissolved Oxygen: >5 mg/L
- Conductivity: <1500 µS/cm
- BOD: <5 mg/L
- TSS: <50 mg/L
- E. coli: <126 CFU/100mL
- Ammonia: <1.0 mg/L
- Nitrate: <10 mg/L

These are EPA standards for safe surface water quality.
Values above max (or below min) may indicate pollution.
    `.trim())}
    style={{ fontSize: '1rem', cursor: 'pointer' }}
  >
    ℹ️ Help
  </button>
</div>
</div>
     
       {plots.thresholdOverlay && (
         <Plot
           data={plots.thresholdOverlay.data}
           layout={plots.thresholdOverlay.layout}
           config={{ responsive: true }}
         />
       )}
     </div>
     
      )}



























      {!loading && plots.parameterImpactStatic && (
        <div className="dashboard-card">
          <h3>📊 Static Parameter Importance (WQI)</h3>
          <Plot
            data={plots.parameterImpactStatic.data}
            layout={plots.parameterImpactStatic.layout}
            config={{ responsive: true }}
          />
        </div>
      )}

      {!loading && plots.parameterImpactTrend && (
        <div className="dashboard-card">
          <h3>📈 Parameter Importance Over Time (WQI)</h3>
          <Plot
            data={plots.parameterImpactTrend.data}
            layout={plots.parameterImpactTrend.layout}
            config={{ responsive: true }}
          />
        </div>
      )}

    </div>
  );
}

export default Multiview;
