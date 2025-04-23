import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Plot from 'react-plotly.js';
import './Dashboard.css';

function Dashboard() {
  const [csvFile, setCsvFile] = useState(null);
  const [availableParams, setAvailableParams] = useState([]);
  const [availableLocations, setAvailableLocations] = useState([]);
  const [selectedVisType, setSelectedVisType] = useState('time_series');
  const [selectedParam, setSelectedParam] = useState('');
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [visualizations, setVisualizations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setCsvFile(file);

    // Parse CSV to get parameters and locations
    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target.result;
      const lines = csvText.split('\n');
      const headers = lines[0].split(',');

      // Extract parameter names (exclude metadata fields)
      const excludeFields = ['OBJECTID', 'SampleDate', 'Location', 'LocationID', 'GlobalID', 'Latitude', 'Longitude', 'FrozenOver'];
      const params = headers.filter(h => !excludeFields.includes(h.trim()));
      setAvailableParams(params);

      // Extract location IDs
      if (lines.length > 1) {
        const locationIndex = headers.findIndex(h => h.trim() === 'LocationID');
        if (locationIndex >= 0) {
          const locationSet = new Set();
          for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',');
            if (cols[locationIndex]) {
              locationSet.add(cols[locationIndex].trim());
            }
          }
          setAvailableLocations(Array.from(locationSet));
        }
      }
    };
    reader.readAsText(file);
  };

  // Visualization type options
  const visTypes = [
    { value: 'time_series', label: 'Time Series' },
    { value: 'parameter_comparison', label: 'Parameter Comparison' },
    { value: 'location_comparison', label: 'Location Comparison' },
    { value: 'map_view', label: 'Map View' },
    { value: 'correlation_matrix', label: 'Correlation Matrix' },
    { value: 'box_plots', label: 'Box Plots' },
    { value: 'threshold_analysis', label: 'Threshold Analysis' },
    { value: 'seasonal_analysis', label: 'Seasonal Analysis' }
  ];

  // Generate a unique ID for each visualization
  const generateId = () => `vis-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // Request visualization from backend
  const generateVisualization = async () => {
    if (!csvFile || (selectedVisType !== 'correlation_matrix' &&
      selectedVisType !== 'map_view' && !selectedParam)) {
      alert('Please select a file, visualization type, and parameter (if required)');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('csv_file', csvFile);
    formData.append('vis_type', selectedVisType);
    formData.append('parameter', selectedParam);
    formData.append('location_filter', JSON.stringify(selectedLocations));

    try {
      const response = await fetch('http://localhost:5050/api/visualize', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Server responded with ${response.status}: ${text}`);
      }

      const result = await response.json();

      if (result.success) {
        const newVisualization = {
          id: generateId(),
          type: selectedVisType,
          parameter: selectedParam,
          locations: [...selectedLocations],
          plotData: JSON.parse(result.plotlyData),
          title: `${selectedVisType.replace(/_/g, ' ')} - ${selectedParam || 'All Parameters'}`
        };

        setVisualizations([...visualizations, newVisualization]);
        
        // Reset selection for next visualization
        setSelectedParam('');
        setSelectedLocations([]);
      } else {
        alert('Error generating visualization: ' + result.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Fetch failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Remove visualization by ID
  const removeVisualization = (id) => {
    setVisualizations(visualizations.filter(vis => vis.id !== id));
  };

  const navigate = useNavigate();

  return (
    <div className="dashboard-root">
      {/* Navigation bar */}
      <nav className="nav-bar" style={{width: '100vw', marginLeft: 'calc(-50vw + 50%)'}}>
        <div className="nav-title">Water Quality Dashboard</div>
        <div className="nav-actions">
          <button className="nav-btn" onClick={() => navigate("/")}>Home</button>
          <button className="nav-btn" onClick={() => navigate("/sources")}>Sources</button>
          <button className="nav-btn">TEMP</button>
          <button className="nav-btn">TEMP</button>
        </div>
      </nav>

      <div className="dashboard-main">
        {/* Control panel */}
        <div className="control-panel">
          <div className="upload-section">
            <div className="upload-header">
              <p className="upload-label">1. Upload Data</p>
              <button 
                type="button" 
                className="upload-btn"
                onClick={() => document.getElementById('csv-upload').click()}
              >
                Upload CSV
              </button>
            </div>
            <input
              type="file"
              id="csv-upload"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            {csvFile && <span className="file-name">{csvFile.name}</span>}
          </div>

          {csvFile && (
            <div className="visualization-controls">
              <h3>2. Configure Visualization</h3>
              <div className="select-row">
                <div className="control-group">
                  <label>Visualization Type:</label>
                  <select value={selectedVisType} onChange={e => setSelectedVisType(e.target.value)}>
                    {visTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div className="control-group">
                  <label>Parameter Type:</label>
                  <select value={selectedParam} onChange={e => setSelectedParam(e.target.value)}>
                    <option value="">Select Parameter Type</option>
                    {availableParams.map(param => (
                      <option key={param} value={param}>{param}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="control-group">
                <label>Filter Locations (optional):</label>
                <div className="location-checkboxes">
                  {availableLocations.map(loc => (
                    <label key={loc} className="location-checkbox">
                      <input
                        type="checkbox"
                        value={loc}
                        checked={selectedLocations.includes(loc)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedLocations([...selectedLocations, loc]);
                          } else {
                            setSelectedLocations(selectedLocations.filter(l => l !== loc));
                          }
                        }}
                      />
                      {loc}
                    </label>
                  ))}
                </div>
              </div>

              <button 
                className="generate-btn" 
                onClick={generateVisualization} 
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Add to Dashboard'}
              </button>
            </div>
          )}
        </div>

        {/* Visualization grid */}
        <div className="visualizations-grid">
          {visualizations.length === 0 && csvFile && (
            <div className="empty-state">
              Configure and add your first visualization to the dashboard
            </div>
          )}
          
          {visualizations.length === 0 && !csvFile && (
            <div className="empty-state">
              Upload a CSV file to get started
            </div>
          )}
          
          {visualizations.map(vis => (
            <div key={vis.id} className="visualization-card">
              <div className="visualization-header">
                <h4>{vis.title}</h4>
                <button className="remove-btn" onClick={() => removeVisualization(vis.id)}>✕</button>
              </div>
              <div className="plot-container">
                <Plot
                  data={vis.plotData.data}
                  layout={{
                    ...vis.plotData.layout,
                    autosize: true,
                    margin: { l: 50, r: 20, t: 30, b: 50 }
                  }}
                  config={{ responsive: true }}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;