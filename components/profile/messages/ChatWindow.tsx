// components/profile/messages/ChatWindow.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

type Message = {
  id: number;
  sender: 'admin' | 'user';
  content: string;
  timestamp: string;
};

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'admin',
      content: "Hey there! Welcome to FitByLena. I'm here if you need help with your workouts.",
      timestamp: '10:00 AM',
    },
    {
      id: 2,
      sender: 'user',
      content: "Thanks! I’d love help planning my next session.",
      timestamp: '10:02 AM',
    },
    {
      id: 3,
      sender: 'admin',
      content: "Awesome! I'll put together a routine based on your goals. 💪",
      timestamp: '10:03 AM',
    },
  ]);

  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;

    const timestamp = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newMsg: Message = {
      id: messages.length + 1,
      sender: 'user',
      content: newMessage,
      timestamp,
    };

    setMessages([...messages, newMsg]);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="chat-window-wrapper p-3 rounded shadow-sm">
      <div className="chat-messages">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            className={`d-flex mb-3 ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {msg.sender === 'admin' && (
              <Image
                src="/admin-avatar.png"
                alt="Admin"
                width={32}
                height={32}
                className="rounded-circle me-2"
              />
            )}

            <div className={`chat-message-${msg.sender}`}>
              <div className="small">{msg.content}</div>
              <div className="text-muted small mt-1">{msg.timestamp}</div>
            </div>

            {msg.sender === 'user' && (
              <Image
                src="/user-avatar.png"
                alt="You"
                width={32}
                height={32}
                className="rounded-circle ms-2"
              />
            )}
          </motion.div>
        ))}
      </div>

      {/* Input box */}
      <div className="d-flex mt-3">
        <input
          type="text"
          placeholder="Type a message..."
          className="form-control me-2"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <button className="btn btn-sm btn-primary" onClick={handleSendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}
