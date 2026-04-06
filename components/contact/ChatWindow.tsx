// components/contact/ChatWindow.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import ChatAvatar from './ChatAvatar';
import ChatInput from './ChatInput';
import MessageBubble from './MessageBubble';

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

const USER_TOKEN_KEY = 'token';
const ADMIN_TOKEN_KEY = 'wraith_admin_token';
const GUEST_MESSAGE_LIMIT = 3;

type Message = {
  id: string;
  sender: 'lena' | 'user';
  text: string;
};

function TypingBubble() {
  return (
    <div className="d-flex justify-content-start mb-3">
      <motion.div
        className="px-3 py-2 rounded-4"
        style={{
          background: 'rgba(214, 132, 255, 0.12)',
          border: '1px solid rgba(214, 132, 255, 0.2)',
          maxWidth: '90px',
        }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25 }}
      >
        <div className="d-flex align-items-center gap-2">
          <span
            style={{
              fontSize: '0.85rem',
              color: 'rgba(120, 70, 150, 0.9)',
              fontWeight: 500,
            }}
          >
            Lena
          </span>

          <div className="d-flex align-items-center gap-1">
            {[0, 1, 2].map((dot) => (
              <motion.span
                key={dot}
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: 'rgba(214, 132, 255, 0.9)',
                  display: 'inline-block',
                }}
                animate={{
                  y: [0, -4, 0],
                  opacity: [0.4, 1, 0.4],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: dot * 0.15,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function getStoredToken() {
  if (typeof window === 'undefined') return null;

  const userToken = localStorage.getItem(USER_TOKEN_KEY);
  const adminToken = localStorage.getItem(ADMIN_TOKEN_KEY);

  return userToken || adminToken || null;
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      sender: 'lena',
      text: "Hey there 👋 I'm Lena! Ask me about fitness, nutrition, or membership plans. Guests can ask a few quick questions before creating an account 💪",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [guestMessageCount, setGuestMessageCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (message: string) => {
    const trimmed = message.trim();
    if (!trimmed) return;

    const token = getStoredToken();
    const isGuest = !token;

    if (isGuest && guestMessageCount >= GUEST_MESSAGE_LIMIT) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          sender: 'lena',
          text:
            "You’ve reached the guest chat limit for now 💜 Create an account to keep chatting with me, get more personalized guidance, and unlock a better FitByLena experience.",
        },
      ]);
      return;
    }

    setLoading(true);

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMsg]);

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      const body = token
        ? { message: trimmed }
        : { message: trimmed };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE}/api/chats/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        const backendError =
          data?.error ||
          'Something went wrong while sending your message.';
        throw new Error(backendError);
      }

      const replyText = data?.chat?.response || "I'm here to help!";

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          sender: 'lena',
          text: replyText,
        },
      ]);

      if (isGuest) {
        setGuestMessageCount((prev) => prev + 1);
      }
    } catch (error) {
      const fallbackText =
        error instanceof Error
          ? error.message
          : 'Oops — something went wrong! Please try again 💭';

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          sender: 'lena',
          text: fallbackText,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="card border-0 shadow-lg rounded-4 p-4 d-flex"
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

        {loading && <TypingBubble />}

        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSend={sendMessage} loading={loading} />
    </motion.div>
  );
}

{/*
// components/contact/ChatWindow.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import ChatAvatar from './ChatAvatar';
import ChatInput from './ChatInput';
import MessageBubble from './MessageBubble';

type Message = {
  id: string;
  sender: 'lena' | 'user';
  text: string;
};

function TypingBubble() {
  return (
    <div className="d-flex justify-content-start mb-3">
      <motion.div
        className="px-3 py-2 rounded-4"
        style={{
          background: 'rgba(214, 132, 255, 0.12)',
          border: '1px solid rgba(214, 132, 255, 0.2)',
          maxWidth: '90px',
        }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25 }}
      >
        <div className="d-flex align-items-center gap-2">
          <span
            style={{
              fontSize: '0.85rem',
              color: 'rgba(120, 70, 150, 0.9)',
              fontWeight: 500,
            }}
          >
            Lena
          </span>

          <div className="d-flex align-items-center gap-1">
            {[0, 1, 2].map((dot) => (
              <motion.span
                key={dot}
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: 'rgba(214, 132, 255, 0.9)',
                  display: 'inline-block',
                }}
                animate={{
                  y: [0, -4, 0],
                  opacity: [0.4, 1, 0.4],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: dot * 0.15,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      sender: 'lena',
      text: "Hey there 👋 I'm Lena! Ask me about workouts, nutrition, or any of our membership plans 💪",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (message: string) => {
    setLoading(true);

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: message,
    };

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
        {
          id: crypto.randomUUID(),
          sender: 'lena',
          text: replyText,
        },
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
      className="card border-0 shadow-lg rounded-4 p-4 d-flex"
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

        {loading && <TypingBubble />}

        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSend={sendMessage} loading={loading} />
    </motion.div>
  );
}



*/}