import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

// Import the smaller UI components
import ChatHeader from '../components/chatheader.jsx';
import MessageList from '../components/messagelist.jsx';
import MessageForm from '../components/messageform.jsx';

// --- Configuration ---
// IMPORTANT: Replace this with your deployed backend's public host name
const BACKEND_HOST = "buzzline-backend.onrender.com";

const ChatPage = () => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const websocket = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('authtoken');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            // Decode the token to get user information
            const decodedToken = jwtDecode(token);
            setCurrentUser(decodedToken);
        } catch (error) {
            console.error("Invalid auth token:", error);
            localStorage.removeItem('authtoken');
            navigate('/login');
            return;
        }
        
        // Establish WebSocket connection
        const ws = new WebSocket(`wss://${BACKEND_HOST}/ws?token=${token}`);
        websocket.current = ws;

        ws.onopen = () => {
            setIsConnected(true);
            setMessages(prev => [...prev, { type: 'system', text: 'You are now connected!' }]);
        };

        ws.onclose = () => {
            setIsConnected(false);
            setMessages(prev => [...prev, { type: 'system', text: 'You have been disconnected.' }]);
        };

        ws.onmessage = (event) => {
            try {
                const messageData = JSON.parse(event.data);
                setMessages(prev => [...prev, messageData]);
            } catch (err) {
                console.error("Could not parse incoming message:", err);
            }
        };

        ws.onerror = (error) => {
            console.error("WebSocket encountered an error:", error);
            setIsConnected(false);
        };

        // Cleanup function to close the connection when the component unmounts
        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, [navigate]);

    const sendMessage = (event) => {
        event.preventDefault();
        if (inputValue.trim() && websocket.current?.readyState === WebSocket.OPEN) {
            websocket.current.send(inputValue);
            setInputValue('');
        }
    };

    return (
        <div className='flex flex-col h-screen bg-gray-100 font-sans'>
            <ChatHeader isConnected={isConnected} />
            <MessageList messages={messages} currentUser={currentUser} />
            <MessageForm
                sendMessage={sendMessage}
                inputValue={inputValue}
                setInputValue={setInputValue}
                isConnected={isConnected}
            />
        </div>
    );
};

export default ChatPage;

