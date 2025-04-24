import './Home.css';
import * as THREE from 'three'
import { useNavigate } from 'react-router-dom';
import EpaGuidelinesTable from './EpaGuidelinesTable'; // Accepts waterwayType as prop
import React, {useState, useEffect, useRef} from 'react'
import vantaWavesMin from 'vanta/dist/vanta.waves.min.js';
//Water Quality Parameters
const waterQualityData = [

  {

    parameter: 'pH',

    description: `pH measures the acidity or alkalinity of water on a scale from 0 to 14, with 7 being neutral. For rivers and streams, a pH range of 6.5 to 8.5 is generally considered optimal for supporting aquatic life. Values outside this range can indicate pollution and may harm organisms sensitive to acidic or basic environments.`

  },

  {

    parameter: 'Temperature',

    description: `Water temperature significantly affects chemical and biological processes in aquatic systems. Warmer water holds less dissolved oxygen, which can stress or even kill fish and other organisms. Temperature also influences the metabolism and reproductive cycles of aquatic life.`

  },

  {

    parameter: 'Dissolved Oxygen (DO)',

    description: `Dissolved oxygen refers to the amount of oxygen available in water for aquatic organisms to breathe. Healthy streams typically have a DO concentration of ≥5 mg/L. Levels below this can lead to hypoxia, stressing or killing aquatic life.`

  },

  {

    parameter: 'Conductivity',

    description: `Conductivity is a measure of the water’s ability to conduct electricity, which correlates with the concentration of dissolved salts and inorganic materials. High conductivity can signal contamination from agricultural runoff or road salts.`

  },

  {

    parameter: 'Biological Oxygen Demand (BOD)',

    description: `BOD measures the amount of oxygen needed by microorganisms to decompose organic matter in water. High BOD values suggest high levels of organic pollution, often from sewage or agricultural runoff.`

  },

  {

    parameter: 'Total Suspended Solids (TSS)',

    description: `TSS refers to particles suspended in water, such as silt and organic matter. High TSS reduces water clarity, clogs fish gills, and can smother benthic habitats. Common sources include erosion and urban runoff.`

  },

  {

    parameter: 'E. coli',

    description: `E. coli is used as an indicator of fecal contamination. Acceptable concentrations are typically ≤126 CFU/100mL. High levels suggest contamination from sewage or animal waste, posing health risks.`

  },

  {

    parameter: 'Ammonia',

    description: `Ammonia exists in ionized and un-ionized forms, the latter being highly toxic to aquatic life. It originates from agricultural runoff, sewage, and decomposing organic matter.`

  },

  {

    parameter: 'Nitrate',

    description: `Nitrate is an essential nutrient that becomes a pollutant at high concentrations, often from fertilizers and septic systems. It can lead to eutrophication and oxygen depletion.`

  }

];

const WaveComponent = (options = {}) => {
  const navigate = useNavigate();
  const [vantaEffect, setVantaEffect] = useState(null)
  const myRef = useRef(null)
  useEffect(() => {
    if (!vantaEffect) {
      setVantaEffect(vantaWavesMin({
        el: myRef.current,
        THREE: THREE
      }))
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy()
    }
  },[vantaEffect])

  return (<div ref={myRef} style={{ height: '100vh', width: '100%' , zIndex: 1}}>
    <div className="center-div">
        <h1>Water Quality Data Visualization: A Runoff Pollutant Advisory</h1>
      </div>

      <div className="list-container">
        <div className="list-div" onClick={() => toggleSection('about-content')}>About Dataset</div>
        <div className="list-div" onClick={() => toggleSection('parameters-content')}>Water Quality Parameters</div>
        <div className="list-div" onClick={() => navigate('/dashboard')}>Visualization Dashboard</div>
        <div className="list-div" onClick={() => toggleSection('epa-content')}>EPA Recommendations</div>
        <div className="list-div" onClick={() => navigate('/sources')}>General Sources</div>
      </div>
</div>)
}

function toggleSection(sectionId) {
  document.querySelectorAll('.section').forEach(section => {
    section.setAttribute('style', 'display: none');
  });
  document.getElementById(sectionId).style.display = 'block';
}

export default function Home() {
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

  //Tab settings for table
  const [openTab, setOpenTab] = useState(null);

 

  const toggleTab = (index) => {

    setOpenTab(openTab === index ? null : index);

  };

  return (
    <div className="App">
      
      <WaveComponent/>

      <div id="about-content" className="section">
        <h2>About this dataset</h2>
        <p>
          This dataset provides water quality measurements for various locations within the Big Sioux River Watershed.
          The data includes key parameters such as pH levels, dissolved oxygen, turbidity, and the presence of pollutants.
          Understanding these factors is essential for assessing water health and making informed decisions regarding conservation efforts.
        </p>
      </div>

      <div id="parameters-content" className="section">
      <h3>Water Quality Parameters</h3>

        <table className="sources-table">

          <tbody>

            {waterQualityData.map((item, index) => (

              <tr key={index}>

                <td className="source-index" onClick={() => toggleTab(index)}>

                  {openTab === index ? '-' : '+'}

                </td>

                <td className="source-link">

                  <span onClick={() => toggleTab(index)} style={{ cursor: 'pointer' }}>

                    {item.parameter}

                  </span>

                  {openTab === index && (

                    <div className="mt-2">

                      <p>{item.description}</p>

                    </div>

                  )}

                </td>

              </tr>

            ))}

          </tbody>

        </table>
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
