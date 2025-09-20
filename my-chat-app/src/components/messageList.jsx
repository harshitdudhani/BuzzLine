import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const AuthCallback = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get("token");

        if (token) {
            // CORRECTED: Use the same key 'authtoken' consistently.
            localStorage.setItem('authtoken', token);
            navigate('/app');
        } else {
            console.error("Authentication failed: No token received.");
            navigate('/login');
        }
    }, [location, navigate]);

    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-lg text-gray-600">Finalizing login...</p>
      </div>
    );
};

export default AuthCallback;
