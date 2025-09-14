import React, { useState, useEffect, useRef } from 'react';



const ChatHeader = ({ isConnected }) => (

 <header className="bg-white shadow-sm p-4 flex items-center justify-between">

  <h1 className="text-2xl font-bold text-gray-800">BuzzLine</h1>

  <div className="flex items-center space-x-2">

   <span className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>

   <span className="text-sm text-gray-600">{isConnected ? 'Connected' : 'Disconnected'}</span>

  </div>

 </header>

);



const MessageItem = ({ msg }) => {

 if (msg.type === 'system') {

  return (

   <div className="text-center w-full my-2">

    <span className="text-xs text-gray-500 bg-gray-200 rounded-full px-3 py-1">{msg.text}</span>

   </div>

  );

 }



 const isSent = msg.type === 'sent';

 const alignment = isSent ? 'justify-end' : 'justify-start';

 const bubbleStyles = isSent

  ? 'bg-blue-500 text-white rounded-br-none'

  : 'bg-gray-200 text-gray-800 rounded-bl-none';



 return (

  <li className={`flex my-2 ${alignment}`}>

   <div className={`rounded-2xl px-4 py-2 max-w-sm md:max-w-md ${bubbleStyles}`}>

    <p>{msg.text}</p>

   </div>

  </li>

 );

};



const MessageList = ({ messages }) => {

 const messageEndRef = useRef(null);



 const scrollToBottom = () => {

  messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });

 };



 useEffect(scrollToBottom, [messages]);



 return (

  <main className="flex-1 overflow-y-auto p-4 md:p-6">

   <div className="max-w-4xl mx-auto">

    <ul>

     {messages.map((msg, index) => (

      <MessageItem key={index} msg={msg} />

     ))}

     <li ref={messageEndRef} />

    </ul>

   </div>

  </main>

 );

};



const MessageForm = ({ sendMessage, inputValue, setInputValue, isConnected }) => {

 const SendIcon = () => (

  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">

   <path d="m22 2-7 20-4-9-9-4Z" /><path d="m22 2-11 11" />

  </svg>

 );



 return (

  <footer className='bg-white border-t border-gray-200 p-4'>

   <form onSubmit={sendMessage} className="flex items-center max-w-4xl mx-auto">

    <input

     type="text"

     value={inputValue}

     onChange={(e) => setInputValue(e.target.value)}

     placeholder="Type a message..."

     className='flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500'

     disabled={!isConnected}

    />

    <button

     type="submit"

     className='ml-3 bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400'

     disabled={!isConnected || !inputValue.trim()}

    >

     <SendIcon />

    </button>

   </form>

  </footer>

 );

};



export default function App() {

 const [messages, setMessages] = useState([]);

 const [inputValue, setInputValue] = useState('');

 const [isConnected, setIsConnected] = useState(false);

 const websocket = useRef(null);



 useEffect(() => {

  const ws = new WebSocket("wss://b6650c36f726.ngrok-free.app");

  websocket.current = ws;



  ws.onopen = () => {

   console.log("Connected to WebSocket Server");

   setIsConnected(true);

   setMessages(prev => [...prev, { type: 'system', text: 'You are Connected!' }]);

  };



  ws.onclose = () => {

   console.log("Disconnected from WebSocket Server");

   setIsConnected(false);

   setMessages(prev => [...prev, { type: 'system', text: 'You have been disconnected.' }]);

  };



  ws.onmessage = (event) => {

   try {

    const messageData = JSON.parse(event.data);

    console.log("Message received from server: ", messageData);

    setMessages(prev => [...prev, { type: 'received', text: messageData.text, timestamp: messageData.timestamp }]);

   } catch (error) {

    console.error("Error parsing message JSON: ", error);

   }

  };



  ws.onerror = (error) => {

   console.error("WebSocket error: ", error);

   setIsConnected(false);

   setMessages(prev => [...prev, { type: 'system', text: 'Connection error. Please refresh.' }]);

  };



  return () => {

   if (ws.readyState === 1) {

    ws.close();

   }

  };

 }, []);



 const sendMessage = (event) => {

  event.preventDefault();

  if (inputValue.trim() && websocket.current && websocket.current.readyState === WebSocket.OPEN) {

   websocket.current.send(inputValue);

   const timestamp = new Date().toISOString();

   setMessages(prev => [...prev, { type: 'sent', text: inputValue, timestamp }]);

   setInputValue('');

  }

 };



 return (

  <div className='flex flex-col h-screen bg-blue-100 font-sans'>

   <ChatHeader isConnected={isConnected} />

   <MessageList messages={messages} />

   <MessageForm

    sendMessage={sendMessage}

    inputValue={inputValue}

    setInputValue={setInputValue}

    isConnected={isConnected}

   />

  </div>

 );

}