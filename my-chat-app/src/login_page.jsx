import React from "react";

const LoginPage = () => {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="text-center p-8 bg-white shadow-lg rounded-lg">
                <h1 className="text-3xl font-bold mb-2">Welcome to Buzzline</h1>
                <p className="text-gray-600 mb-6">This is a placeholder for the login page.</p>
                <a 
                    href="https://stoppably-unjudicable-neta.ngrok-free.app/login/google"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
                >
                    <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google logo" className="w-5 h-5 mr-2"/>
                    <span>Sign in with Google</span>
                </a>
            </div>
        </div>
    );
};

export default LoginPage;
