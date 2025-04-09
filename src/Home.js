import './Home.css';
import { styled } from '@mui/material/styles'
import {useNavigate } from 'react-router-dom';

//create hidden input
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

//Functions in Components
function toggleSection(sectionId) {
  document.querySelectorAll('.section').forEach(section => {
      section.setAttribute('style', 'display: none');
  });
  document.getElementById(sectionId).style.display = 'block';
}

function handleFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
      const csvData = e.target.result.split('\n').map(row => row.split(','));
      console.log("CSV Data Uploaded:", csvData); // You can expand this to handle the data later
  };
  reader.readAsText(file);
}

//Main Webpage Body
export default function Home() {
  //Dashboard Navigation
  const navigate = useNavigate();

  return (
    <div className="App">

      <div className="center-div">
            <h1>Water Quality Data Visualization: A Runoff Pollutant Advisory</h1>
        </div>
        <div className="list-container">
            <div className="list-div" onClick={() => toggleSection('about-content')}>About Dataset</div>
            <div className="list-div" onClick={() => toggleSection('parameters-content')}>Water Quality Parameters</div>
            <div className="list-div" onClick={() => {navigate('/dashboard')}}>Visualization Dashboard</div>
            <div className="list-div" onClick={() => toggleSection('epa-content')}>EPA Recommendations</div>
            <label className="list-div">
              <HiddenInput type='file' accept='.csv' onChange={() => handleFileUpload}/>
              Upload</label>
        </div>

        <div id="about-content" className="section">
            <h2>About this dataset</h2>
            <p>
                This dataset provides water quality measurements for various locations within the Big Sioux River Watershed.
                The data includes key parameters such as pH levels, dissolved oxygen, turbidity, and the presence of pollutants.
                Understanding these factors is essential for assessing water health and making informed decisions regarding conservation efforts.
            </p>
        </div>

        <div id="parameters-content" className="section">
            <h2>Water Quality Parameters</h2>
            <p>Details on water quality measurement parameters.</p>
        </div>

        <div id="epa-content" className="section">
            <h2>EPA Recommendations</h2>
            <p>Guidelines and recommendations from the EPA.</p>
        </div>
    </div>
  );
}

