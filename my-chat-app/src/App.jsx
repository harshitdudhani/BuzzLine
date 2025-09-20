import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importing pages based on your file structure
import LoginPage from './pages/login_page';
import AuthCallback from './pages/authcallback';
import ChatPage from './pages/chatPage'; // A necessary page for your app
import HomePage from './pages/homePage'; // A necessary page for your app

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

