import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check for the authentication token in local storage
    const token = localStorage.getItem('authtoken');
    if (token) {
      // If a token exists, the user is logged in. Redirect to the chat app.
      navigate('/app');
    } else {
      // If no token is found, send the user to the login page.
      navigate('/login');
    }
  }, [navigate]);

  // Display a loading message while the redirection is happening
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <p className="text-lg text-gray-600">Loading...</p>
    </div>
  );
};

export default HomePage;

