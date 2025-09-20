import React from 'react';

const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="m22 2-7 20-4-9-9-4Z" /><path d="m22 2-11 11" />
    </svg>
);

const MessageForm = ({ sendMessage, inputValue, setInputValue, isConnected }) => {
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

export default MessageForm;
