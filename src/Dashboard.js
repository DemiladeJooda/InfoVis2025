import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import { styled } from '@mui/material/styles';
import HomeStyle from './Home.css'
import './Dashboard.css';

function Dashboard() {
  const [csvFile, setCsvFile] = useState(null);
  const [availableParams, setAvailableParams] = useState([]);
  const [availableLocations, setAvailableLocations] = useState([]);
  const [selectedVisType, setSelectedVisType] = useState('time_series');
  const [selectedParam, setSelectedParam] = useState('');
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [plotData, setPlotData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Reset visualization and selections
  const resetVisualization = () => {
    setPlotData(null);
    setSelectedParam('');
    setSelectedLocations([]);
  };

  // Hidden Input Object
  const HiddenInput = styled('input')({
    clip: 'rect(0,0,0,0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
  })

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
        setPlotData(JSON.parse(result.plotlyData));
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

  return (
    <div className="dashboard-container">
      <h2>Water Quality Dashboard</h2>
      
      <div className="upload-section">
        <h3>1. Upload Data</h3>
        <label className="list-div">
              <HiddenInput type='file' accept='.csv' onChange={handleFileUpload}/>
              Upload</label>
      </div>
      
      {csvFile && (
        <div className="visualization-controls">
          <h3>2. Select Visualization</h3>
          
          <div className="control-group">
            <label>Visualization Type:</label>
            <select value={selectedVisType} onChange={e => setSelectedVisType(e.target.value)}>
              {visTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          
          {selectedVisType !== 'correlation_matrix' && selectedVisType !== 'map_view' && (
            <div className="control-group">
              <label>Parameter:</label>
              <select value={selectedParam} onChange={e => setSelectedParam(e.target.value)}>
                <option value="">Select Parameter</option>
                {availableParams.map(param => (
                  <option key={param} value={param}>{param}</option>
                ))}
              </select>
            </div>
          )}
          
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
          
          <button onClick={generateVisualization} disabled={loading}>
            {loading ? 'Generating...' : 'Generate Visualization'}
          </button>
        </div>
      )}
      
      <div className="visualization-display">
        {plotData && (
          <>
            <div className="plot-container">
              <Plot
                data={plotData.data}
                layout={plotData.layout}
                config={{ responsive: true }}
                style={{ width: '100%', height: '600px' }}
              />
            </div>
            <div className="visualization-controls">
              <button 
                onClick={resetVisualization} 
                className="reset-button">
                Create New Visualization
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
