// src/Sources.js
import React from 'react';
import './Sources.css';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';

const Sources = () => {
  const navigate = useNavigate();

  const sourceList = [
    { name: 'EPA National Recommended Criteria', url: 'https://www.epa.gov/wqc/national-recommended-water-quality-criteria' },
    { name: 'EPA Aquatic Life Criteria', url: 'https://www.epa.gov/wqc/aquatic-life-criteria' },
    { name: 'EPA & USGS Guidance', url: 'https://pubs.usgs.gov/fs/2003/3142/' },
    { name: 'EPA Secondary Treatment Regulation', url: 'https://www.epa.gov/npdes/secondary-treatment-regulations' },
    { name: 'Skunk Creek TMDL', url: 'https://danr.sd.gov/Conservation/WatershedProtection/TMDL/docs/skunktmdl.pdf' },
    { name: 'EPA 2012 Recreational Criteria', url: 'https://www.epa.gov/wqc/recreational-water-quality-criteria-and-methods' },
    { name: 'EPA 2013 Ammonia Criteria', url: 'https://www.epa.gov/wqc/aquatic-life-criteria-ammonia' },
    { name: 'EPA MCL – Drinking Water Standard', url: 'https://www.epa.gov/ground-water-and-drinking-water/national-primary-drinking-water-regulations' },
    { name: 'State Lake Guidance', url: 'https://www.iowadnr.gov/portals/idnr/uploads/water/standards/ws2012.pdf' },
    { name: 'EPA Lake Stratification Study', url: 'https://www.epa.gov/sites/default/files/2015-12/documents/criteria_lakes-reservoirs_final.pdf' },
    { name: 'Wetland Monitoring Handbook', url: 'https://www.epa.gov/sites/default/files/2015-07/documents/handbook.pdf' },
    { name: 'EPA Wetland Guidance', url: 'https://www.epa.gov/wetlands' },
    { name: 'EPA Wetland Indicators', url: 'https://www.epa.gov/wetlands/wetland-indicators' },
    { name: 'EPA Definition of Rivers and Streams', url: 'https://www.epa.gov/national-aquatic-resource-surveys/indicators-rivers-and-streams' },
    { name: 'EPA Definition of Lakes and Ponds', url: 'https://www.epa.gov/national-aquatic-resource-surveys/lakes' },
    { name: 'EPA Definition of Wetlands', url: 'https://www.epa.gov/wetlands/what-wetland' },
    { name: 'EPA Definition of Estuaries', url: 'https://www.epa.gov/nep/what-estuary' },
    { name: 'EPA Definition of Coastal Waters', url: 'https://www.epa.gov/beaches/coastal-waters' },
    { name: 'EPA Definition of Groundwater', url: 'https://www.epa.gov/ground-water-and-drinking-water' },
    { name: 'EPA Definition of Drinking Water', url: 'https://www.epa.gov/sourcewaterprotection' },
    { name: 'EPA Water Quality Criteria', url: 'https://www.epa.gov/wqc' },
    { name: 'EPA National Aquatic Resource Surveys', url: 'https://www.epa.gov/national-aquatic-resource-surveys' },
    { name: 'EPA Source Water Protection', url: 'https://www.epa.gov/sourcewaterprotection' },
    { name: 'EPA Wetlands Information', url: 'https://www.epa.gov/wetlands' },
    { name: 'South Dakota Department of Agriculture and Natural Resources', url: 'https://danr.sd.gov/' },
  ];

  return (
    <div>
      <nav className="nav-bar" style={{width: '100vw', marginLeft: 'calc(-50vw + 50%)'}}>
        <div className="nav-title">Water Quality Dashboard</div>
        <div className="nav-actions">
          <button className="nav-btn" onClick={() => navigate("/")}>Home</button>
          <button className="nav-btn" onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button className="nav-btn">TEMP</button>
          <button className="nav-btn">TEMP</button>
        </div>
      </nav>

      <footer className="sources-footer">
        <h3>General Sources</h3>
        <table className="sources-table">
          <tbody>
            {sourceList.map((src, idx) => (
              <tr key={idx}>
                <td className="source-index">{idx + 1}</td>
                <td className="source-link">
                  <a href={src.url} target="_blank" rel="noopener noreferrer">
                    {src.name}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </footer>
    </div>
  );
};

export default Sources;
