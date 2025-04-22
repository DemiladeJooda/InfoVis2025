import React from 'react';
import './EpaGuidelinesTable.css';

// Default parameter values
const defaultParameters = [
  { parameter: 'pH', guideline: '6.5 – 9.0', source: 'EPA National Recommended Criteria' },
  { parameter: 'Temperature', guideline: '≤ 32°C (general upper bound)', source: 'EPA Aquatic Life Criteria' },
  { parameter: 'Dissolved Oxygen', guideline: '≥ 5.0 mg/L', source: 'EPA Aquatic Life Criteria' },
  { parameter: 'Conductivity', guideline: '≤ 500 µS/cm', source: 'EPA & USGS Guidance' },
  { parameter: 'Biological Oxygen Demand (BOD)', guideline: '≤ 5 mg/L', source: 'EPA Secondary Treatment Regulation' },
  { parameter: 'Total Suspended Solids (TSS)', guideline: '≤ 158 mg/L (30-day avg), ≤ 263 mg/L (daily max)', source: 'Skunk Creek TMDL' },
  { parameter: 'E. coli', guideline: '≤ 126 organisms/100 mL', source: 'EPA 2012 Recreational Criteria' },
  { parameter: 'Ammonia', guideline: '≤ 1.9 mg/L (acute), ≤ 0.26 mg/L (chronic)', source: 'EPA 2013 Ammonia Criteria' },
  { parameter: 'Nitrate', guideline: '≤ 10 mg/L (as N)', source: 'EPA MCL – Drinking Water Standard' },
];

// Per-waterway overrides
const overrides = {
  lakes: {
    'Total Suspended Solids (TSS)': { guideline: '≤ 100 mg/L (typical for shallow lakes)', source: 'State Lake Guidance' },
    'Dissolved Oxygen': { guideline: '≥ 6.0 mg/L (upper layer)', source: 'EPA Lake Stratification Study' },
  },
  wetlands: {
    'Total Suspended Solids (TSS)': { guideline: '≤ 80 mg/L (baseline for vegetated wetlands)', source: 'Wetland Monitoring Handbook' },
    'E. coli': { guideline: 'Thresholds vary; often not primary concern', source: 'EPA Wetland Guidance' },
    'Dissolved Oxygen': { guideline: 'Variable; not consistently applied', source: 'EPA Wetland Indicators' },
  },
};

// Map source labels to URLs
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
  'Rivers and Streams': 'https://www.epa.gov/national-aquatic-resource-surveys/indicators-rivers-and-streams',
  'Lakes and Ponds': 'https://www.epa.gov/national-aquatic-resource-surveys/lakes',
  'Wetlands': 'https://www.epa.gov/wetlands/what-wetland',
  'Estuaries': 'https://www.epa.gov/nep/what-estuary',
  'Coastal Waters': 'https://www.epa.gov/beaches/coastal-waters',
  'Groundwater': 'https://www.epa.gov/ground-water-and-drinking-water',
  'Drinking Water': 'https://www.epa.gov/sourcewaterprotection',
};

// Waterway blurbs
const waterwayBlurbs = {
  rivers: {
    description: 'Rivers and streams are flowing surface waters that transport water and materials across landscapes. They are typically classified as perennial, intermittent, or ephemeral based on flow patterns.',
    source: 'Rivers and Streams',
  },
  lakes: {
    description: 'Lakes and ponds are standing bodies of freshwater, often stratified by temperature. They serve as habitats and sources of drinking water, irrigation, and recreation.',
    source: 'Lakes and Ponds',
  },
  wetlands: {
    description: 'Wetlands are transitional areas between land and water where the soil is saturated or flooded for long periods. They provide flood control, water filtration, and wildlife habitat.',
    source: 'Wetlands',
  },
  estuaries: {
    description: 'Estuaries are coastal zones where freshwater mixes with saltwater, forming nutrient-rich habitats critical for fish and bird species.',
    source: 'Estuaries',
  },
  coastal: {
    description: 'Coastal waters include ocean-adjacent waters within U.S. territorial boundaries, managed for marine life, recreation, and shipping.',
    source: 'Coastal Waters',
  },
  groundwater: {
    description: 'Groundwater is water stored underground in aquifers and accessed through wells. It is a major source of drinking water and is protected under the Safe Drinking Water Act.',
    source: 'Groundwater',
  },
  drinking: {
    description: 'Drinking water sources include rivers, lakes, and groundwater bodies that supply public water systems. These sources are regulated for safety by the EPA.',
    source: 'Drinking Water',
  },
};

const EpaGuidelinesTable = ({ waterwayType = 'rivers' }) => {
  const custom = overrides[waterwayType] || {};
  const blurb = waterwayBlurbs[waterwayType];

  const resolvedParams = defaultParameters.map(row => {
    const override = custom[row.parameter];
    return override ? { ...row, ...override } : row;
  });

  const allSources = [...resolvedParams.map(r => r.source), blurb?.source].filter(Boolean);
  const uniqueSources = Array.from(new Set(allSources));
  const sourceNumberMap = Object.fromEntries(uniqueSources.map((src, i) => [src, i + 1]));

  return (
    <div className="epa-guidelines-container">
      <h2>EPA Guidelines – {waterwayType.replace(/^\w/, c => c.toUpperCase())}</h2>

      {blurb && (
        <div className="waterway-blurb">
          <p>{blurb.description} <sup><a href={`#ref-${sourceNumberMap[blurb.source]}`}>[{sourceNumberMap[blurb.source]}]</a></sup></p>
        </div>
      )}

      <table className="epa-guidelines-table fixed-layout">
        <thead>
          <tr>
            <th>Parameter</th>
            <th>Guideline</th>
            <th>Ref</th>
          </tr>
        </thead>
        <tbody>
          {resolvedParams.map((row, idx) => (
            <tr key={idx}>
              <td>{row.parameter}</td>
              <td>{row.guideline}</td>
              <td><a href={`#ref-${sourceNumberMap[row.source]}`}>{sourceNumberMap[row.source]}</a></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="source-links">
        <h3>Source References</h3>
        <ol>
          {uniqueSources.map((src, idx) => (
            <li key={idx} id={`ref-${idx + 1}`}>
              {sourceLinks[src] ? (
                <a href={sourceLinks[src]} target="_blank" rel="noopener noreferrer">{src}</a>
              ) : (
                src
              )}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default EpaGuidelinesTable;
