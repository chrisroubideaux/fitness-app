// components/profile/messages/ChatWindow.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import ChatAvatar from './ChatAvatar';
import MessageBubble from './MessageBubble';
import ChatInput from '@/components/contact/ChatInput';

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

const USER_TOKEN_KEYS = ['authToken', 'token'];

type ChatSummary = {
  id: string;
  message?: string | null;
  response?: string | null;
};

type Message = {
  id: string;
  sender: 'lena' | 'user';
  text: string;
};

type ChatWindowProps = {
  userName?: string;
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

function getUserToken() {
  if (typeof window === 'undefined') return null;

  for (const key of USER_TOKEN_KEYS) {
    const token = localStorage.getItem(key);
    if (token) return token;
  }

  return null;
}

function getFirstName(fullName?: string) {
  const trimmed = (fullName || '').trim();
  if (!trimmed) return '';
  return trimmed.split(' ')[0];
}

function mapChatsToMessages(chats: ChatSummary[]): Message[] {
  const ordered = [...chats].reverse();
  const mapped: Message[] = [];

  for (const chat of ordered) {
    if (chat.message) {
      mapped.push({
        id: `${chat.id}-user`,
        sender: 'user',
        text: chat.message,
      });
    }

    if (chat.response) {
      mapped.push({
        id: `${chat.id}-lena`,
        sender: 'lena',
        text: chat.response,
      });
    }
  }

  return mapped;
}

export default function ChatWindow({ userName = '' }: ChatWindowProps) {
  const firstName = getFirstName(userName);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      sender: 'lena',
      text: firstName
        ? `Hey ${firstName} 👋 I’m Lena. I’m here to help with your workouts, recovery, nutrition, and membership questions whenever you need me 💪`
        : "Hey 👋 I’m Lena. Ask me about your workouts, recovery, nutrition, or membership plan and I’ll help however I can 💪",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [bootLoading, setBootLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const historyLoadedRef = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (historyLoadedRef.current) return;
    historyLoadedRef.current = true;

    const loadChatHistory = async () => {
      const token = getUserToken();

      if (!token) {
        setMessages([
          {
            id: 'missing-token',
            sender: 'lena',
            text: 'I couldn’t verify your session. Please log in again to chat with Lena.',
          },
        ]);
        setBootLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/api/chats/me`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || 'Failed to load chat history.');
        }

        const chats = Array.isArray(data?.chats) ? data.chats : [];
        const historicalMessages = mapChatsToMessages(chats);

        if (historicalMessages.length > 0) {
          setMessages(historicalMessages);
        }
      } catch (error) {
        console.error('Failed to load Lena chats:', error);
      } finally {
        setBootLoading(false);
      }
    };

    loadChatHistory();
  }, []);

  const sendMessage = async (message: string) => {
    const trimmed = message.trim();
    if (!trimmed) return;

    const token = getUserToken();
    if (!token) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          sender: 'lena',
          text: 'Your session looks expired. Please log in again so I can respond properly.',
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
      const res = await fetch(`${API_BASE}/api/chats/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: trimmed,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Something went wrong while sending your message.');
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
        minHeight: '560px',
        background: 'rgba(255,255,255,0.93)',
        backdropFilter: 'blur(12px)',
      }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <ChatAvatar />

      <div
        className="flex-grow-1 overflow-auto mb-3"
        style={{
          maxHeight: '390px',
          padding: '12px',
          borderRadius: '14px',
          background: 'rgba(248,248,252,0.82)',
          border: '1px solid rgba(214,132,255,0.08)',
        }}
      >
        {bootLoading ? (
          <TypingBubble />
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg.id} sender={msg.sender} text={msg.text} />
          ))
        )}

        {loading && <TypingBubble />}

        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSend={sendMessage} loading={loading} />
    </motion.div>
  );
}

{/*
'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import ChatAvatar from './ChatAvatar';
import MessageBubble from './MessageBubble';
import ChatInput from '@/components/contact/ChatInput';

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

const USER_TOKEN_KEYS = ['authToken', 'token'];

type ChatSummary = {
  id: string;
  message?: string | null;
  response?: string | null;
};

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

function getUserToken() {
  if (typeof window === 'undefined') return null;

  for (const key of USER_TOKEN_KEYS) {
    const token = localStorage.getItem(key);
    if (token) return token;
  }

  return null;
}

function mapChatsToMessages(chats: ChatSummary[]): Message[] {
  const ordered = [...chats].reverse();
  const mapped: Message[] = [];

  for (const chat of ordered) {
    if (chat.message) {
      mapped.push({
        id: `${chat.id}-user`,
        sender: 'user',
        text: chat.message,
      });
    }

    if (chat.response) {
      mapped.push({
        id: `${chat.id}-lena`,
        sender: 'lena',
        text: chat.response,
      });
    }
  }

  return mapped;
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      sender: 'lena',
      text: "Hey 👋 I’m Lena. Ask me about your workouts, recovery, nutrition, or membership plan and I’ll help however I can 💪",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [bootLoading, setBootLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const historyLoadedRef = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (historyLoadedRef.current) return;
    historyLoadedRef.current = true;

    const loadChatHistory = async () => {
      const token = getUserToken();

      if (!token) {
        setMessages([
          {
            id: 'missing-token',
            sender: 'lena',
            text: 'I couldn’t verify your session. Please log in again to chat with Lena.',
          },
        ]);
        setBootLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/api/chats/me`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || 'Failed to load chat history.');
        }

        const chats = Array.isArray(data?.chats) ? data.chats : [];
        const historicalMessages = mapChatsToMessages(chats);

        if (historicalMessages.length > 0) {
          setMessages(historicalMessages);
        }
      } catch (error) {
        console.error('Failed to load Lena chats:', error);
      } finally {
        setBootLoading(false);
      }
    };

    loadChatHistory();
  }, []);

  const sendMessage = async (message: string) => {
    const trimmed = message.trim();
    if (!trimmed) return;

    const token = getUserToken();
    if (!token) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          sender: 'lena',
          text: 'Your session looks expired. Please log in again so I can respond properly.',
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
      const res = await fetch(`${API_BASE}/api/chats/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: trimmed,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Something went wrong while sending your message.');
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
        minHeight: '560px',
        background: 'rgba(255,255,255,0.93)',
        backdropFilter: 'blur(12px)',
      }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <ChatAvatar />

      <div
        className="flex-grow-1 overflow-auto mb-3"
        style={{
          maxHeight: '390px',
          padding: '12px',
          borderRadius: '14px',
          background: 'rgba(248,248,252,0.82)',
          border: '1px solid rgba(214,132,255,0.08)',
        }}
      >
        {bootLoading ? (
          <TypingBubble />
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg.id} sender={msg.sender} text={msg.text} />
          ))
        )}

        {loading && <TypingBubble />}

        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSend={sendMessage} loading={loading} />
    </motion.div>
  );
}


*/}