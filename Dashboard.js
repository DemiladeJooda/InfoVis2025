import React, { useState, useContext } from 'react';
import Plot from 'react-plotly.js';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';
import { CsvContext } from './CsvContext';




function Dashboard() {

  const [availableParams, setAvailableParams] = useState([]);
  const [availableLocations, setAvailableLocations] = useState([]);
  const [selectedVisType, setSelectedVisType] = useState('time_series');
  const [selectedParam, setSelectedParam] = useState('');
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [plotData, setPlotData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [dateBounds, setDateBounds] = useState({ min: '', max: '' });

  const [uploadMessage, setUploadMessage] = useState('Upload a CSV file to begin visualizing water quality data.');
  const [brushedPoints, setBrushedPoints] = useState([]);

  const { csvFile, setCsvFile } = useContext(CsvContext);
  const navigate = useNavigate();

  
  // Reset visualization and selections
  const resetVisualization = () => {
    setPlotData(null);
    setSelectedParam('');
    setSelectedLocations([]);
    setBrushedPoints([]);
  };

  //  // Hidden Input Object
  //  const HiddenInput = styled('input')({
  //   clip: 'rect(0,0,0,0)',
  //   clipPath: 'inset(50%)',
  //   height: 1,
  //   overflow: 'hidden',
  //   position: 'absolute',
  //   bottom: 0,
  //   left: 0,
  //   whiteSpace: 'nowrap',
  //   width: 1,
  // })

  const handleBrushedPoints = (event) => {
    // Only update if points exist
    if (event?.points?.length > 0) {
      const selected = event.points.map(pt => ({
        
        x: pt.x,
        y: pt.y,
        location: plotData.data[pt.curveNumber]?.name || 'Unknown'
      }));
  
      setBrushedPoints(selected);
    }
    // Do NOT clear the table if event is empty
  };
  
  
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setCsvFile(file);
    setUploadMessage('✅ Successfully uploaded: ' + file.name);
  
    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target.result;
      const lines = csvText.split('\n');
      const headers = lines[0].split(',');
  
      const excludeFields = ['OBJECTID', 'SampleDate', 'Location', 'LocationID', 'GlobalID', 'Latitude', 'Longitude', 'FrozenOver'];
      const params = headers.filter(h => !excludeFields.includes(h.trim()));
      setAvailableParams(params);
      
      const dateIndex = headers.findIndex(h => h.trim() === 'SampleDate');
  if (dateIndex >= 0) {
    const allDates = lines.slice(1)
      .map(line => line.split(',')[dateIndex])
      .filter(Boolean)
      .map(dateStr => new Date(dateStr))
      .filter(date => !isNaN(date));

    if (allDates.length > 0) {
      const minDate = new Date(Math.min(...allDates)).toISOString().split('T')[0];
      const maxDate = new Date(Math.max(...allDates)).toISOString().split('T')[0];
      setDateBounds({ min: minDate, max: maxDate });
    }
  }
      const locationIndex = headers.findIndex(h => h.trim() === 'LocationID');
      if (locationIndex >= 0) {
        const locationSet = new Set();
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',');
          if (cols[locationIndex]) locationSet.add(cols[locationIndex].trim());
        }
        setAvailableLocations(Array.from(locationSet));
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
    { value: 'seasonal_analysis', label: 'Seasonal Analysis' },
    { value: 'scatter_plot', label: 'Scatter Plot' }

  ];

  // Request visualization from backend
  const generateVisualization = async () => {
    setBrushedPoints([]);
    const isDateRangeSelected = dateRange.start && dateRange.end;
  const paramRequired = selectedVisType !== 'correlation_matrix' && selectedVisType !== 'map_view';
const scatterNeedsTwo = selectedVisType === 'scatter_plot' && (!Array.isArray(selectedParam) || !selectedParam[0] || !selectedParam[1]);

if (isDateRangeSelected) {
  if (dateRange.start < dateBounds.min || dateRange.end > dateBounds.max) {
    alert(`Selected date range is out of bounds.\nDataset ranges from ${dateBounds.min} to ${dateBounds.max}`);
    return;
  }
}

if (!csvFile || (paramRequired && !selectedParam) || scatterNeedsTwo) {
  alert('Please select a file, visualization type, and parameter(s) (if required)');
  return;
}

    
    setLoading(true);
    
    const formData = new FormData();
    formData.append('csv_file', csvFile);
    formData.append('vis_type', selectedVisType);

    if (selectedVisType === 'scatter_plot') {
      formData.append('parameter', JSON.stringify(selectedParam));
    } else if (selectedVisType !== 'map_view' && selectedVisType !== 'correlation_matrix') {
      formData.append('parameter', selectedParam);
    }

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
      <h1>Water Quality Dashboard</h1>
      
      <div className="upload-section dashboard-card">
  <h2>1. Upload Data</h2>
  <input type="file" accept=".csv" onChange={handleFileUpload} />
  <p className="upload-msg">{uploadMessage}</p>
</div>

      
      {csvFile && (
        <div className="visualization-controls dashboard-card">
          <h2>2. Water Quality Visualization Analytics </h2>
          
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
      <select value={selectedParam[0] || ''} onChange={e => setSelectedParam([e.target.value, selectedParam[1]])}>
        <option value="">X Parameter</option>
        {availableParams.map(param => (
          <option key={param} value={param}>{param}</option>
        ))}
      </select>
      <select value={selectedParam[1] || ''} onChange={e => setSelectedParam([selectedParam[0], e.target.value])}>
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



<div className="control-group">
  <label>Date Range:</label>
  <div className="date-range-inputs">
    <input 
      type="date" 
      value={dateRange.start} 
      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} 
    />
    <input 
      type="date" 
      value={dateRange.end} 
      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} 
    />
  </div>
</div>



        
          
          <button onClick={generateVisualization} disabled={loading}>
            {loading ? 'Generating...' : 'Generate Visualization'}
          </button>

          <button onClick={() => navigate('/multiview')} className="multiview-button">
   Multiview Analytics
</button>

        </div>

        
      )}
      
      <div className="visualization-display">
        {plotData && (
          <>
            <div className="dashboard-card">

            <div className="plot-container">

            <Plot
  data={plotData.data}
  layout={{
    ...plotData.layout,
    autosize: true,
    dragmode: 'select', // enable brushing (not zoom)
    margin: { t: 50, b: 100 },
    legend: {
      orientation: "h",
      x: 0.5,
      xanchor: "center",
      y: -0.3,
    },
  }}
  config={{ responsive: true, scrollZoom: false, displayModeBar: true }}
  useResizeHandler={true}
  style={{ width: "100%", height: "100%" }}
  className="plotly-graph"
  onSelected={(event) => handleBrushedPoints(event)}
/>


            </div>

            </div>


            {brushedPoints.length > 0 && (
  <div className="brushed-panel">
    <button onClick={() => setBrushedPoints([])} className="close-panel">×</button>
    <h3>Selected Data</h3>
    <table>
      <thead>
        <tr>
          <th>Value</th>
          <th>Location</th>
        </tr>
      </thead>
      <tbody>
        {brushedPoints.map((pt, idx) => (
          <tr key={idx}>
            <td>{pt.y}</td>
            <td>{pt.location}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}




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
