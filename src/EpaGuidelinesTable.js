import React from 'react';
import './EpaGuidelinesTable.css';

// Default parameter values
const defaultParameters = [
  {
    parameter: 'pH',
    guideline: '6.5 – 9.0',
    source: 'EPA National Recommended Criteria',
  },
  {
    parameter: 'Temperature',
    guideline: '≤ 32°C (general upper bound)',
    source: 'EPA Aquatic Life Criteria',
  },
  {
    parameter: 'Dissolved Oxygen',
    guideline: '≥ 5.0 mg/L',
    source: 'EPA Aquatic Life Criteria',
  },
  {
    parameter: 'Conductivity',
    guideline: '≤ 500 µS/cm',
    source: 'EPA & USGS Guidance',
  },
  {
    parameter: 'Biological Oxygen Demand (BOD)',
    guideline: '≤ 5 mg/L',
    source: 'EPA Secondary Treatment Regulation',
  },
  {
    parameter: 'Total Suspended Solids (TSS)',
    guideline: '≤ 158 mg/L (30-day avg), ≤ 263 mg/L (daily max)',
    source: 'Skunk Creek TMDL',
  },
  {
    parameter: 'E. coli',
    guideline: '≤ 126 organisms/100 mL',
    source: 'EPA 2012 Recreational Criteria',
  },
  {
    parameter: 'Ammonia',
    guideline: '≤ 1.9 mg/L (acute), ≤ 0.26 mg/L (chronic)',
    source: 'EPA 2013 Ammonia Criteria',
  },
  {
    parameter: 'Nitrate',
    guideline: '≤ 10 mg/L (as N)',
    source: 'EPA MCL – Drinking Water Standard',
  },
];

// Per-waterway overrides
const overrides = {
  lakes: {
    'Total Suspended Solids (TSS)': {
      guideline: '≤ 100 mg/L (typical for shallow lakes)',
      source: 'State Lake Guidance',
    },
    'Dissolved Oxygen': {
      guideline: '≥ 6.0 mg/L (upper layer)',
      source: 'EPA Lake Stratification Study',
    },
  },
  wetlands: {
    'Total Suspended Solids (TSS)': {
      guideline: '≤ 80 mg/L (baseline for vegetated wetlands)',
      source: 'Wetland Monitoring Handbook',
    },
    'E. coli': {
      guideline: 'Thresholds vary; often not primary concern',
      source: 'EPA Wetland Guidance',
    },
    'Dissolved Oxygen': {
      guideline: 'Variable; not consistently applied',
      source: 'EPA Wetland Indicators',
    },
  },
};

// Map source labels to actual URLs
const sourceLinks = {
  'EPA National Recommended Criteria': 'https://www.epa.gov/wqc/national-recommended-water-quality-criteria',
  'EPA Aquatic Life Criteria': 'https://www.epa.gov/wqc/aquatic-life-criteria',
  'EPA & USGS Guidance': 'https://pubs.usgs.gov/fs/2003/3142/',
  'EPA Secondary Treatment Regulation': 'https://www.epa.gov/npdes/secondary-treatment-regulations',
  'Skunk Creek TMDL': 'https://danr.sd.gov/Conservation/WatershedProtection/TMDL/docs/skunktmdl.pdf',
  'EPA 2012 Recreational Criteria': 'https://www.epa.gov/wqc/recreational-water-quality-criteria-and-methods',
  'EPA 2013 Ammonia Criteria': 'https://www.epa.gov/wqc/aquatic-life-criteria-ammonia',
  'EPA MCL – Drinking Water Standard': 'https://www.epa.gov/ground-water-and-drinking-water/national-primary-drinking-water-regulations',
  'State Lake Guidance': 'https://www.iowadnr.gov/portals/idnr/uploads/water/standards/ws2012.pdf',
  'EPA Lake Stratification Study': 'https://www.epa.gov/sites/default/files/2015-12/documents/criteria_lakes-reservoirs_final.pdf',
  'Wetland Monitoring Handbook': 'https://www.epa.gov/sites/default/files/2015-07/documents/handbook.pdf',
  'EPA Wetland Guidance': 'https://www.epa.gov/wetlands',
  'EPA Wetland Indicators': 'https://www.epa.gov/wetlands/wetland-indicators',
};

const EpaGuidelinesTable = ({ waterwayType = 'rivers' }) => {
  const custom = overrides[waterwayType] || {};

  const resolvedParams = defaultParameters.map(row => {
    const override = custom[row.parameter];
    return override ? { ...row, ...override } : row;
  });

  // Get unique sources used in current table
  const uniqueSources = Array.from(
    new Set(resolvedParams.map(r => r.source))
  );

  return (
    <div className="epa-guidelines-container">
      <h2>EPA Guidelines – {waterwayType.replace(/^\w/, c => c.toUpperCase())}</h2>
      <table className="epa-guidelines-table fixed-layout">
        <thead>
          <tr>
            <th>Parameter</th>
            <th>Guideline</th>
            <th>Source</th>
          </tr>
        </thead>
        <tbody>
          {resolvedParams.map((row, idx) => (
            <tr key={idx}>
              <td>{row.parameter}</td>
              <td>{row.guideline}</td>
              <td>{row.source}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="source-links">
        <h3>Source References</h3>
        <ul>
          {uniqueSources.map((src, idx) => (
            <li key={idx}>
              {sourceLinks[src] ? (
                <a href={sourceLinks[src]} target="_blank" rel="noopener noreferrer">
                  {src}
                </a>
              ) : (
                src
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default EpaGuidelinesTable;
