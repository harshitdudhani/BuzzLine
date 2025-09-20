import React from 'react';

// IMPORTANT: This URL must match your backend server's public address.
const BACKEND_LOGIN_URL = "https://stoppably-unjudicable-neta.ngrok-free.app/login/google";

const LoginPage = () => {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="text-center p-10 bg-white shadow-2xl rounded-xl max-w-lg w-full">
                <h1 className="text-5xl font-bold text-gray-800 mb-3">Welcome to BuzzLine</h1>
                <p className="text-gray-600 mb-10">A modern, real-time chat application.</p>
                <a 
                    href={BACKEND_LOGIN_URL}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg inline-flex items-center transition-transform transform hover:scale-105 shadow-lg"
                >
                    <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google logo" className="w-6 h-6 mr-4"/>
                    <span>Sign in with Google</span>
                </a>
            </div>
        </div>
    );
};

export default LoginPage;

