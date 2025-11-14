// components/contact/MessageBubble
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export interface MessageBubbleProps {
  sender: 'user' | 'lena';
  text?: string;
  isTyping?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ sender, text, isTyping = false }) => {
  const isUser = sender === 'user';

  // 🌈 Typing dots animation
  const dotStyle: React.CSSProperties = {
    background: 'linear-gradient(90deg, #d38bff, #ff9fd6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontSize: '1.2rem',
    fontWeight: 700,
    lineHeight: 1,
    display: 'inline-block',
    marginRight: 4,
  };

  const TypingDots = () => (
    <motion.div
      className="d-flex align-items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      {[0, 0.2, 0.4].map((delay, i) => (
        <motion.span
          key={i}
          style={dotStyle}
          animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 0.8, delay }}
        >
          •
        </motion.span>
      ))}
    </motion.div>
  );

  return (
    <div
      className={`d-flex mb-3 ${isUser ? 'justify-content-end' : 'justify-content-start'} align-items-end`}
      style={{ gap: '10px' }}
    >
      {/* 💜 Lena’s tiny avatar */}
      {!isUser && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="rounded-circle overflow-hidden shadow-sm"
          style={{
            width: 36,
            height: 36,
            border: '2px solid rgba(214,132,255,0.6)',
            flexShrink: 0,
          }}
        >
          <Image
            src="/images/admin/image2.png"
            alt="Lena"
            width={36}
            height={36}
            style={{ objectFit: 'cover' ,
              
            }}
          />
        </motion.div>
      )}

      {/* 💬 Message bubble */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className={`p-3 rounded-4 shadow-sm`}
        style={{
          maxWidth: '75%',
          fontSize: '0.95rem',
          lineHeight: 1.5,
          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          background: isUser
            ? 'linear-gradient(135deg, rgba(170,0,255,0.9), rgba(255,150,255,0.6))'
            : 'rgba(255,255,255,0.85)',
          color: isUser ? '#fff' : '#111',
          boxShadow: isTyping ? '0 0 15px rgba(214,132,255,0.5)' : '0 2px 6px rgba(0,0,0,0.05)',
          transition: 'background 0.3s ease, color 0.3s ease',
        }}
      >
        {isTyping ? <TypingDots /> : <p className="mb-0">{text}</p>}
      </motion.div>

      {/* 🧍 User side spacer for alignment */}
      {isUser && <div style={{ width: 40 }} />}
    </div>
  );
};

export default MessageBubble;

