import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Dashboard from './Dashboard';
import Sources from './Sources'; // ✅ new import
import './App.css';
import { CsvProvider } from './CsvContext';
import Multiview from './Multiview';

function App() {
  return (
    <CsvProvider>
  <Router>
      <head>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/vanta/dist/vanta.waves.min.js"></script>
      </head>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/sources" element={<Sources/>}/>
          <Route path="/multiview" element={<Multiview />} />
        </Routes>
      </div>
    </Router>
    </CsvProvider>
  
  );
}

export default App;
