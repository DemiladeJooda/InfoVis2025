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
          setPlots(data.plotlyData);
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

      {!loading && plots.parameterImpactStatic && (
        <div className="dashboard-card">
          <h3>  Parameter Contribution (WQI)</h3>
          <Plot
            data={plots.parameterImpactStatic.data}
            layout={plots.parameterImpactStatic.layout}
            config={{ responsive: true }}
          />
        </div>
      )}

      {!loading && plots.parameterImpactTrend && (
        <div className="dashboard-card">
          <h3> Parameter Contribution Over Time (WQI)</h3>
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