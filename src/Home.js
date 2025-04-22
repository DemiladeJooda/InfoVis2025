import './Home.css';
import { styled } from '@mui/material/styles'
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import EpaGuidelinesTable from './EpaGuidelinesTable'; // Optional default/general table

// 🔌 Optional future imports
// import RiversTable from './RiversTable';
// import LakesTable from './LakesTable';
// import WetlandsTable from './WetlandsTable';
// etc.

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
    console.log("CSV Data Uploaded:", csvData);
  };
  reader.readAsText(file);
}

export default function Home() {
  const navigate = useNavigate();
  const [activeEpaTab, setActiveEpaTab] = useState(null);

  const epaTabs = [
    { key: 'rivers', label: 'Rivers & Streams' },
    { key: 'lakes', label: 'Lakes & Ponds' },
    { key: 'wetlands', label: 'Wetlands' },
    { key: 'estuaries', label: 'Estuaries' },
    { key: 'coastal', label: 'Coastal Waters' },
    { key: 'groundwater', label: 'Groundwater' },
    { key: 'drinking', label: 'Drinking Water Sources' },
  ];

  return (
    <div className="App">

      <div className="center-div">
        <h1>Water Quality Data Visualization: A Runoff Pollutant Advisory</h1>
      </div>

      <div className="list-container">
        <div className="list-div" onClick={() => toggleSection('about-content')}>About Dataset</div>
        <div className="list-div" onClick={() => toggleSection('parameters-content')}>Water Quality Parameters</div>
        <div className="list-div" onClick={() => { navigate('/dashboard') }}>Visualization Dashboard</div>
        <div className="list-div" onClick={() => toggleSection('epa-content')}>EPA Recommendations</div>
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
        <p>
          Guidelines and recommendations from the EPA. Water sources have various quality standards and restrictions based on
          their uses and are governed by a patchwork of legislation and rules. These designations include Aquatic Life, Recreation,
          Fish and Shellfish Consumption, Public Water Supply, and Agricultural/Industrial use. Select the appropriate designation from 
	  the list below and explore the guidelines for water quality.
        </p>

        {/* 🔘 Tab Buttons */}
        <div className="epa-tab-buttons">
          {epaTabs.map(tab => (
            <button
              key={tab.key}
              className={activeEpaTab === tab.key ? 'active' : ''}
              onClick={() => setActiveEpaTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 📦 Tab Content Area */}
        <div className="epa-tab-content">
          {activeEpaTab === 'rivers' && (
            <div>
              <h3>Rivers & Streams</h3>
              <p>Typical criteria include dissolved oxygen, temperature, sediment load, and E. coli thresholds.</p>
              {/* <RiversTable /> */}
              <EpaGuidelinesTable />
            </div>
          )}
          {activeEpaTab === 'lakes' && (
            <div>
              <h3>Lakes & Ponds</h3>
              <p>Guidelines focus on eutrophication, algal bloom potential, and nutrient loading.</p>
              {/* <LakesTable /> */}
              <EpaGuidelinesTable />
            </div>
          )}
          {activeEpaTab === 'wetlands' && (
            <div>
              <h3>Wetlands</h3>
              <p>Wetlands are protected for their ecological services and are evaluated for hydrology and biodiversity health.</p>
              {/* <WetlandsTable /> */}
              <EpaGuidelinesTable />
            </div>
          )}
          {activeEpaTab === 'estuaries' && (
            <div>
              <h3>Estuaries</h3>
              <p>Criteria often include salinity gradients, dissolved oxygen, and nutrient thresholds.</p>
              <EpaGuidelinesTable />
            </div>
          )}
          {activeEpaTab === 'coastal' && (
            <div>
              <h3>Coastal Waters</h3>
              <p>Includes ocean-adjacent waters, typically governed by marine life protection standards and recreational criteria.</p>
              <EpaGuidelinesTable />
            </div>
          )}
          {activeEpaTab === 'groundwater' && (
            <div>
              <h3>Groundwater</h3>
              <p>Evaluated for drinking safety, typically for nitrates, arsenic, and microbial content.</p>
              <EpaGuidelinesTable />
            </div>
          )}
          {activeEpaTab === 'drinking' && (
            <div>
              <h3>Drinking Water Sources</h3>
              <p>Includes rivers, lakes, and reservoirs; held to Safe Drinking Water Act MCLs (maximum contaminant levels).</p>
              <EpaGuidelinesTable />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
