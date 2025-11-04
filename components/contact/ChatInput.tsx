// components/contact/ChatInput.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaPaperPlane } from 'react-icons/fa';

type ChatInputProps = {
  onSend: (message: string) => void;
  loading?: boolean;
};

export default function ChatInput({ onSend, loading }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || loading) return;
    onSend(message.trim());
    setMessage('');
  };

  return (
    <motion.form
      className="d-flex mt-3"
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <input
        type="text"
        className="form-control rounded-start-pill px-3"
        placeholder="Type your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={loading}
      />
      <motion.button
        type="submit"
        className="btn rounded-end-pill text-white px-4"
        style={{
          background:
            'linear-gradient(135deg, rgba(170,0,255,0.9), rgba(255,150,255,0.6))',
          border: 'none',
        }}
        whileTap={{ scale: 0.95 }}
      >
        {loading ? '...' : <FaPaperPlane />}
      </motion.button>
    </motion.form>
  );
}

