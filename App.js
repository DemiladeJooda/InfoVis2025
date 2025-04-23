import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Multiview from './Multiview';
import Dashboard from './Dashboard';
import './App.css';
import { CsvProvider } from './CsvContext';

function App() {
  return (
    <CsvProvider>
 <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/multiview" element={<Multiview />} />
        </Routes>
      </div>
    </Router>

    </CsvProvider>
   
  );
}

export default App;