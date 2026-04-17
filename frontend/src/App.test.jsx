import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';

// Test: Simple component
const TestPage = () => <div className="p-10 text-center"><h1>Test Page Loading</h1></div>;

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<TestPage />} />
          <Route path="/test" element={<TestPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
