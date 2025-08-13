// components/profile/messages/ChatWindow.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

type Message = {
  id: number;
  sender: 'admin' | 'user';
  content: string;
  timestamp: string;
};

type Props = {
  selectedThread: {
    id: string;
    sender: string;
    subject: string;
    messages: Message[];
  };
  onDeleteThread?: (threadId: string) => void;
  onDeleteAllThreads?: () => void;
};

export default function ChatWindow({
  selectedThread,
  onDeleteThread,
  onDeleteAllThreads,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    setMessages(selectedThread.messages);
  }, [selectedThread]);

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;
    const newMsg: Message = {
      id: messages.length + 1,
      sender: 'user',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    setMessages([...messages, newMsg]);
    setNewMessage('');
  };

  const handleDeleteThread = () => {
    if (onDeleteThread) {
      onDeleteThread(selectedThread.id);
    }
  };

  const handleDeleteAll = () => {
    if (onDeleteAllThreads) {
      onDeleteAllThreads();
    }
  };

  return (
    <div className="chat-window-wrapper p-3 rounded shadow-sm">
      {/* Top Header with Delete and Delete All buttons */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0">Conversation with {selectedThread.sender}</h6>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-danger btn-sm" onClick={handleDeleteThread}>
            🗑️ Delete
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={handleDeleteAll}>
            🧹 Delete All
          </button>
        </div>
      </div>

      <h6 className="mb-3">{selectedThread.subject}</h6>

      <div className="chat-messages bg-transparent" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
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
            <div className={`p-2 ${msg.sender === 'user' ? 'chat-message-user' : 'chat-message-admin'}`}>
              <div className="small">{msg.content}</div>
              <div className="text-muted small mt-1">{msg.timestamp}</div>
            </div>
            {msg.sender === 'user' && (
              <Image
                src="/user-avatar.png"
                alt="User"
                width={32}
                height={32}
                className="rounded-circle ms-2"
              />
            )}
          </motion.div>
        ))}
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button className='btn btn-sm' onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
}



/*
'use client'

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

type Message = {
  id: number;
  sender: 'admin' | 'user';
  content: string;
  timestamp: string;
};

type Props = {
  selectedThread: {
    id: string;
    sender: string;
    subject: string;
    messages: Message[];
  } | null;
};

export default function ChatWindow({ selectedThread }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (selectedThread) {
      setMessages(selectedThread.messages);
    }
  }, [selectedThread]);

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;
    const newMsg: Message = {
      id: messages.length + 1,
      sender: 'user',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([...messages, newMsg]);
    setNewMessage('');
  };

  if (!selectedThread) return <div>Select a message to view the conversation.</div>;

  return (
    <div className="chat-window-wrapper p-3 rounded shadow-sm">
      <h6 className="mb-3">{selectedThread.subject}</h6>
      <div className="chat-messages" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            className={`d-flex mb-3 ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {msg.sender === 'admin' && (
              <Image src="/admin-avatar.png" alt="Admin" width={32} height={32} className="rounded-circle me-2" />
            )}
            <div className={`p-2 ${msg.sender === 'user' ? 'chat-message-user' : 'chat-message-admin'}`}>
              <div className="small">{msg.content}</div>
              <div className="text-muted small mt-1">{msg.timestamp}</div>
            </div>
            {msg.sender === 'user' && (
              <Image src="/user-avatar.png" alt="User" width={32} height={32} className="rounded-circle ms-2" />
            )}
          </motion.div>
        ))}
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
}




*/