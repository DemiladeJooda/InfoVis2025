import React from 'react';
import './EpaGuidelinesTable.css'; // Make sure this CSS file exists

const EpaGuidelinesTable = () => {
  const data = [
    {
      parameter: 'Total Suspended Solids (TSS)',
      guideline: '<= 158 mg/L (30-day avg), <= 263 mg/L (daily max)',
      source: 'Skunk Creek TMDL (South Dakota DANR)',
    },
    {
      parameter: 'E. coli',
      guideline: '<= 126 organisms/100 mL (30-day geometric mean)',
      source: 'EPA Recreational Water Quality Criteria',
    },
    {
      parameter: 'Designated Uses',
      guideline: 'Fish propagation, irrigation, recreation, domestic water supply',
      source: 'SD Administrative Rules § 74:51',
    },
    {
      parameter: 'Antidegradation Policy',
      guideline: 'Protect existing uses and prevent degradation of high-quality waters',
      source: 'Clean Water Act § 303(d)',
    },
  ];

  return (
    <div className="epa-guidelines-container">
      <h2>EPA Guidelines for Surface Water Quality</h2>
      <table className="epa-guidelines-table">
        <thead>
          <tr>
            <th>Parameter</th>
            <th>Guideline</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx}>
              <td>{row.parameter}</td>
              <td>{row.guideline}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EpaGuidelinesTable;
