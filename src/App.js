import Dashboard from './Dashboard';
import Home from './Home'
import { Routes, Route } from 'react-router-dom';

//Main Webpage Body
export default function App() {
  //The Main App Provides Navigation between our main page and the dashboard page
  return (
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/dashboard' element={<Dashboard/>} />
        </Routes>
  );
}

