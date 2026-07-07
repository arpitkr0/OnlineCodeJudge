import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ProblemPage from './pages/ProblemPage';
import Login from './pages/Login';
import Register from './pages/Register';
import SubmissionHistory from './pages/SubmissionHistory';
import AdminPortal from './pages/AdminPortal';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-dark-900 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-dark-900 font-sans">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/problems/:id" element={<ProblemPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/history" element={<SubmissionHistory />} />
              <Route path="/admin" element={<AdminPortal />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
