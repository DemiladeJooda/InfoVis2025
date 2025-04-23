import React, { createContext, useState } from 'react';

export const CsvContext = createContext();

export const CsvProvider = ({ children }) => {
  const [csvFile, setCsvFile] = useState(null);
  return (
    <CsvContext.Provider value={{ csvFile, setCsvFile }}>
      {children}
    </CsvContext.Provider>
  );
};
