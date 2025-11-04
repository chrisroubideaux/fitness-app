// components/contact/ChatWindow.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import ChatAvatar from './ChatAvatar';
import ChatInput from './ChatInput';
import MessageBubble from './MessageBubble';

type Message = {
  id: string;
  sender: 'lena' | 'user';
  text: string;
};

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      sender: 'lena',
      text: "Hey there 👋 I'm Lena! Ask me about workouts, nutrition, or any of our membership plans 💪",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (message: string) => {
    setLoading(true);
    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: message };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch('http://localhost:5000/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Guest',
          email: 'guest@example.com',
          message,
        }),
      });

      const data = await res.json();
      const replyText = data?.chat?.response || "I'm here to help!";
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), sender: 'lena', text: replyText },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          sender: 'lena',
          text: 'Oops — something went wrong! Please try again 💭',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="card border-0 shadow-lg rounded-4 p-4"
      style={{
        width: '100%',
        maxWidth: '600px',
        minHeight: '500px',
        background: 'rgba(255,255,255,0.9)',
      }}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <ChatAvatar />

      <div
        className="flex-grow-1 overflow-auto mb-3"
        style={{
          maxHeight: '340px',
          padding: '10px',
          borderRadius: '12px',
          background: 'rgba(250,250,250,0.7)',
        }}
      >
        {messages.map((msg) => (
          <MessageBubble key={msg.id} sender={msg.sender} text={msg.text} />
        ))}
      </div>

      <ChatInput onSend={sendMessage} loading={loading} />
    </motion.div>
  );
}
