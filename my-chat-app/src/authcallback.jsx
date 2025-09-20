import React, {useEffect} from "react";
import {useLocation, useNavigate} from "react-router-dom";

const AuthCallback = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get("token");

        if(token)
        {
            localStorage.setItem('authtoken', token);
            navigate('/app');
        }
        else{
            navigate('/login');
        }
    },[location, navigate]);
    return <div>loading...</div>
};
export default AuthCallback;
