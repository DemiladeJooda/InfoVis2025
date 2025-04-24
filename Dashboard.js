import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Plot from 'react-plotly.js';
import './Dashboard.css';
import { CsvContext } from './CsvContext';
import Papa from 'papaparse';


function Dashboard() {
  const { csvFile, setCsvFile } = useContext(CsvContext);
  const [availableParams, setAvailableParams] = useState([]);
  const [availableLocations, setAvailableLocations] = useState([]);
  const [selectedVisType, setSelectedVisType] = useState('time_series');
  const [selectedParam, setSelectedParam] = useState('');
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [visualizations, setVisualizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [plotData, setPlotData] = useState(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [dateBounds, setDateBounds] = useState({ min: '', max: '' });
  const [brushedPoints, setBrushedPoints] = useState([]);
  const [scatterParams, setScatterParams] = useState(['', '']);
  const [summaryData, setSummaryData] = useState(null);
  const [heatmapData, setHeatmapData] = useState(null);
  const [distributionCharts, setDistributionCharts] = useState([]);

  const navigate = useNavigate();


  const resetVisualization = () => {
    setPlotData(null);
    setSelectedParam('');
    setSelectedLocations([]);
    setBrushedPoints([]);
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setCsvFile(file);
  
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function(results) {
        const data = results.data;
        const headers = results.meta.fields;
  
        const excludeFields = ['OBJECTID', 'SampleDate', 'Location', 'LocationID', 'GlobalID', 'Latitude', 'Longitude', 'FrozenOver'];
        const params = headers.filter(h => !excludeFields.includes(h.trim()));
        setAvailableParams(params);
  
        const locationSet = new Set();
        data.forEach(row => {
          if (row.Location) locationSet.add(row.Location.trim());
        });
        setAvailableLocations(Array.from(locationSet));
  
        const dates = data
          .map(row => row.SampleDate?.trim())
          .filter(d => !!d && !isNaN(Date.parse(d)))
          .sort((a, b) => new Date(a) - new Date(b));
  
        if (dates.length) {
          setDateBounds({ min: dates[0], max: dates[dates.length - 1] });
        }
      }
    });
  };


  const handleBrushedPoints = (event, sourcePlotData) => {
    if (!event?.points?.length || !sourcePlotData) return;
  
    const selected = event.points.map(pt => ({
      x: pt.x,
      y: pt.y,
      location: sourcePlotData.data[pt.curveNumber]?.name || 'Unknown'
    }));
  
    setBrushedPoints(selected);
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
    { value: 'seasonal_analysis', label: 'Seasonal Analysis' },
    { value: 'scatter_plot', label: 'Scatter Plot' }
  ];

  // Generate a unique ID for each visualization
  const generateId = () => `vis-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // Request visualization from backend
  const generateVisualization = async () => {
    setBrushedPoints([]);
    const isDateRangeSelected = dateRange.start && dateRange.end;
    const paramRequired = selectedVisType !== 'correlation_matrix' && selectedVisType !== 'map_view';
    const scatterNeedsTwo = selectedVisType === 'scatter_plot' &&
  (!Array.isArray(scatterParams) || !scatterParams[0] || !scatterParams[1]);

    if (isDateRangeSelected) {
      if (dateRange.start < dateBounds.min || dateRange.end > dateBounds.max) {
        alert(`Selected date range is out of bounds.\nDataset ranges from ${dateBounds.min} to ${dateBounds.max}`);
        return;
      }
    }

    if (!csvFile) {
      alert('Please upload a CSV file.');
      return;
    }
    
    if (!selectedVisType) {
      alert('Please select a visualization type.');
      return;
    }
    
    if (selectedVisType === 'scatter_plot') {
      if (!scatterParams[0] || !scatterParams[1]) {
        alert('Please select both X and Y parameters for the scatter plot.');
        return;
      }
    } else if (selectedVisType !== 'correlation_matrix' && selectedVisType !== 'map_view') {
      if (!selectedParam) {
        alert('Please select a parameter for the selected visualization.');
        return;
      }
    }
    

    setLoading(true);

    const formData = new FormData();
    formData.append('csv_file', csvFile);
    formData.append('vis_type', selectedVisType);
    
    formData.append(
      'parameter',
      selectedVisType === 'map_view' ? '' :
      selectedVisType === 'scatter_plot' ? JSON.stringify(scatterParams) :
      selectedParam
    );
    
    
    formData.append('date_range', JSON.stringify({
      start: isDateRangeSelected ? dateRange.start : dateBounds.min,
      end: isDateRangeSelected ? dateRange.end : dateBounds.max,
    }));
    
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

      console.log("Visualization response:", result);

if (result.plotlyData) {
  try {
    const parsed = JSON.parse(result.plotlyData);
    console.log("Parsed Plotly data:", parsed);
  } catch (err) {
    console.error("Failed to parse plotlyData:", err);
  }
}


      if (result.success) {
        if (selectedVisType === 'summary_statistics') {
          setDistributionCharts(
            result.distributions ?
              result.distributions.map(d => {
                try {
                  return JSON.parse(d);
                } catch (error) {
                  console.error('Error parsing distribution chart JSON:', error);
                  return null;
                }
              }).filter(Boolean) : []
          );
          setSummaryData(null);
          setHeatmapData(null);
          setPlotData(null);
        } else {
          
          const newVisualization = {
            id: generateId(),
            type: selectedVisType,
            parameter: selectedVisType === 'scatter_plot' ? scatterParams : selectedParam,
            title: `${selectedVisType.replace(/_/g, ' ')} - ${
              selectedVisType === 'scatter_plot'
                ? `${scatterParams[0]} vs ${scatterParams[1]}`
                : selectedParam || 'All Parameters'
            }`,
            locations: [...selectedLocations],
            plotData: JSON.parse(result.plotlyData)
          };
          
          
      
          setVisualizations([...visualizations, newVisualization]);
          setPlotData(newVisualization.plotData);
          setSummaryData(null);
          setHeatmapData(null);
          setDistributionCharts([]);
      
          setSelectedParam(selectedVisType === 'scatter_plot' ? ['', ''] : '');
          setSelectedLocations([]);
        }
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

 

  
  return (
    <div className="dashboard-root">
      <nav className="nav-bar" style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)' }}>
        <div className="nav-title">Water Quality Dashboard</div>
        <div className="nav-actions">
          <button className="nav-btn" onClick={() => navigate("/")}>Home</button>
          <button className="nav-btn" onClick={() => navigate("/sources")}>Sources</button>
          <button className="nav-btn" onClick={() => navigate("/multiview")}>Multiview</button>
          <button className="nav-btn">TEMP</button>
        </div>
      </nav>

      <div className="dashboard-main">
        <div className="control-section">
          <div className="control-panel">
            <div className="upload-section">
              <div className="upload-header">
                <p className="upload-label">1. Upload Data</p>
                <button type="button" className="upload-btn" onClick={() => document.getElementById('csv-upload').click()}>
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

                <div className="control-group">
                  <label>Visualization Type:</label>
                  <select value={selectedVisType} onChange={e => setSelectedVisType(e.target.value)}>
                    {visTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                {selectedVisType === 'scatter_plot' ? (
                  <div className="control-group">
                    <label>Scatter Plot Parameters (X and Y):</label>
                    <div style={{ display: "flex", gap: "1rem" }}>
                      <select value={scatterParams[0]} onChange={e => setScatterParams([e.target.value, scatterParams[1]])}>
                        <option value="">X Parameter</option>
                        {availableParams.map(param => (
                          <option key={param} value={param}>{param}</option>
                        ))}
                      </select>
                      <select value={scatterParams[1]} onChange={e => setScatterParams([scatterParams[0], e.target.value])}>
                        <option value="">Y Parameter</option>
                        {availableParams.map(param => (
                          <option key={param} value={param}>{param}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  selectedVisType !== 'map_view' && selectedVisType !== 'correlation_matrix' && (
                    <div className="control-group">
                      <label>Parameter:</label>
                      <select value={selectedParam} onChange={e => setSelectedParam(e.target.value)}>
                        <option value="">Select Parameter</option>
                        {availableParams.map(param => (
                          <option key={param} value={param}>{param}</option>
                        ))}
                      </select>
                    </div>
                  )
                )}


                <div className="control-group">
                  <label>Date Range:</label>
                  <div className="date-range-inputs">
                    <input type="date" value={dateRange.start} onChange={e => setDateRange({ ...dateRange, start: e.target.value })} />
                    <input type="date" value={dateRange.end} onChange={e => setDateRange({ ...dateRange, end: e.target.value })} />
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

                <button className="generate-btn" onClick={generateVisualization} disabled={loading}>
                  {loading ? 'Generating...' : 'Add to Dashboard'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="visualization-section">
          <div className="visualizations-grid">
            {visualizations.length === 0 && csvFile && (
              <div className="empty-state">Configure and add your first visualization to the dashboard</div>
            )}

            {visualizations.length === 0 && !csvFile && (
              <div className="empty-state">Upload a CSV file to get started</div>
            )}

            {visualizations.map(vis => (
              <div key={vis.id} className="visualization-card">
                <div className="visualization-header">
                  <h4>{vis.title}</h4>
                  <button className="remove-btn" onClick={() => removeVisualization(vis.id)}>✕</button>
                </div>

                <div className="plot-container" style={{ height: '500px' }}>
                <Plot
                  data={vis.plotData.data}
                  layout={{
                    ...vis.plotData.layout,
                    height: 500, // force height
                    autosize: false, // disable autosize
                    dragmode: 'select',
                    margin: { l: 40, r: 40, t: 40, b: 40 }
                  }}
                  config={{ responsive: true, scrollZoom: false, displayModeBar: true }}
                  onSelected={(e) => handleBrushedPoints(e, vis.plotData)}
                  style={{ width: '100%', height: '100%' }}
                  className="plotly-graph"
                />
              </div>



              </div>
            ))}
          </div>

          {brushedPoints.length > 0 && (
            <div className="brushed-panel">
              <button onClick={() => setBrushedPoints([])} className="close-panel">×</button>
              <h3>Selected Data</h3>
              <table>
                <thead>
                  <tr>
                    <th>X</th>
                    <th>Y</th>
                    <th>Location</th>
                  </tr>
                </thead>
                <tbody>
                  {brushedPoints.map((pt, idx) => (
                    <tr key={idx}>
                      <td>{pt.x}</td>
                      <td>{pt.y}</td>
                      <td>{pt.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {plotData && (
            <div className="visualization-controls">
              <button onClick={resetVisualization} className="reset-button">
                Create New Visualization
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


export default Dashboard;