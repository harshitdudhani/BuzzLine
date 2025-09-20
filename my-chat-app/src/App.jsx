import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importing pages with consistent lowercase paths to match filenames
import LoginPage from './pages/loginpage';
import AuthCallback from './pages/authcallback';
import ChatPage from './pages/chatpage'; // Corrected from chatPage
import HomePage from './pages/homepage'; // Corrected from homePage

function App() {
  return (
    <Router>
      <Routes>
        {/* --- Authentication Routes --- */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        {/* --- Main Application Routes --- */}
        {/* After login, the user is redirected here */}
        <Route path="/app" element={<ChatPage />} />
        
        {/* The entry point of your application */}
        <Route path="/" element={<HomePage />} />
        
        {/* --- Fallback Route --- */}
        {/* Redirect any unknown paths to the homepage */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;

