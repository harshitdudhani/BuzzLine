import React from 'react';

const MessageItem = ({ msg, currentUser }) => {
    if (msg.type === 'system') {
        return (
            <div className="text-center w-full my-2">
                <span className="text-xs text-gray-500 bg-gray-200 rounded-full px-3 py-1">{msg.text}</span>
            </div>
        );
    }

    if (!currentUser) return null; // Don't render messages until user info is loaded

    const isSentByMe = msg.sender === currentUser.name;
    const alignment = isSentByMe ? 'items-end' : 'items-start';
    const bubbleStyles = isSentByMe
        ? 'bg-blue-500 text-white rounded-br-none'
        : 'bg-gray-200 text-gray-800 rounded-bl-none';

    return (
        <li className={`flex flex-col my-2 ${alignment}`}>
            {!isSentByMe && <span className="text-xs text-gray-500 ml-3 mb-1">{msg.sender}</span>}
            <div className={`rounded-2xl px-4 py-2 max-w-sm md:max-w-md ${bubbleStyles}`}>
                <p>{msg.text}</p>
            </div>
        </li>
    );
};

export default MessageItem;
