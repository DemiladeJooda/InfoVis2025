import './Home.css';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import EpaGuidelinesTable from './EpaGuidelinesTable'; // Accepts waterwayType as prop

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

  useEffect(() => {
    // Set default tab to 'rivers' when 'epa-content' becomes visible
    const observer = new MutationObserver(() => {
      const epaContent = document.getElementById('epa-content');
      if (epaContent && epaContent.style.display !== 'none' && !activeEpaTab) {
        setActiveEpaTab('rivers');
      }
    });
    observer.observe(document.body, { attributes: true, subtree: true });
    return () => observer.disconnect();
  }, [activeEpaTab]);

  return (
    <div className="App">
      <div className="center-div">
        <h2>Water Quality Data Visualization: A Runoff Pollutant Advisory</h2>
      </div>

      <div className="list-container center-div">
        <div className="list-div" onClick={() => toggleSection('about-content')}>About Dataset</div>
        <div className="list-div" onClick={() => toggleSection('parameters-content')}>Water Quality Parameters</div>
        <div className="list-div" onClick={() => navigate('/dashboard')}>Visualization Dashboard</div>
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

        <div className="epa-tab-content">
          {activeEpaTab && (
            <>
              <h3>{epaTabs.find(t => t.key === activeEpaTab)?.label}</h3>
              <EpaGuidelinesTable waterwayType={activeEpaTab} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
