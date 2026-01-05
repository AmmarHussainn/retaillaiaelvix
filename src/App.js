
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import './index.css'; // Ensure tailwind is applied if not already via index.js, but standard is usually index.js. 
// I will remove App.css import as it usually contains default react styling.

function App() {
  return (
    <Router>
      <div className="antialiased text-gray-900 bg-white min-h-screen font-sans">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          {/* Default redirect to login for now since there's no protected dashboard yet */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
