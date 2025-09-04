// components/admin/messages/ChatWindow.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { MessageThread, UIMessage } from './types';

type ApiMessage = {
  id: string;
  conversation_id: string;
  sender_role: 'admin' | 'user';
  body: string;
  created_at: string; // ISO with Z from backend
  read_by_user_at: string | null;
  read_by_admin_at: string | null;
};

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

// ✅ Use adminToken
async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init.headers || {}),
  };
  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}: ${text || 'Request failed'}`);
  }
  return res.json();
}

type Props = {
  selectedThread: MessageThread;
  onDeleteThread?: (threadId: string) => void;
  onDeleteAllThreads?: () => void;
  onActivity?: () => void;
};

export default function AdminChatWindow({
  selectedThread,
  onDeleteThread,
  onDeleteAllThreads,
  onActivity,
}: Props) {
  const [conversationId, setConversationId] = useState<string | undefined>(selectedThread.id);
  const [messages, setMessages] = useState<UIMessage[]>(selectedThread.messages ?? []);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let abort = false;

    async function load() {
      if (!conversationId) return;
      setLoading(true);
      try {
        const data = await api<ApiMessage[]>(
          `/api/messages/conversations/${conversationId}/messages?limit=30`
        );
        if (abort) return;

        const mapped: UIMessage[] = data.map((m) => ({
          id: m.id,
          sender: m.sender_role,
          content: m.body,
          timestamp: new Date(m.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        }));
        setMessages(mapped);

        // mark read as admin
        await api<{ ok: boolean; read_at: string }>(
          `/api/messages/conversations/${conversationId}/read`,
          { method: 'POST' }
        );
        onActivity?.();
      } catch (e) {
        console.error(e);
      } finally {
        if (!abort) setLoading(false);
      }
    }

    load();
    return () => {
      abort = true;
    };
  }, [conversationId, onActivity]);

  useEffect(() => {
    setConversationId(selectedThread.id);
    setMessages(selectedThread.messages ?? []);
  }, [selectedThread]);

  const handleSendMessage = async () => {
    const body = newMessage.trim();
    if (!body) return;

    try {
      const payload =
        conversationId
          ? { conversation_id: conversationId, body }
          : selectedThread.user_id
          ? { user_id: selectedThread.user_id, body }
          : null;

      if (!payload) {
        console.error('Missing conversation_id and user_id; cannot send.');
        return;
      }

      const created = await api<ApiMessage>(`/api/messages/send`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!conversationId) setConversationId(created.conversation_id);

      setMessages((prev) => [
        ...prev,
        {
          id: created.id,
          sender: created.sender_role, // 'admin' when using adminToken
          content: created.body,
          timestamp: new Date(created.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ]);

      setNewMessage('');
      onActivity?.();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteThread = () => {
    if (onDeleteThread && conversationId) onDeleteThread(conversationId);
  };

  const handleDeleteAll = () => onDeleteAllThreads?.();

  return (
    <div className="chat-window-wrapper p-3 rounded shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0">Conversation with {selectedThread.sender}</h6>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={handleDeleteThread}
            disabled={!conversationId}
          >
            🗑️ Delete
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={handleDeleteAll}>
            🧹 Delete All
          </button>
        </div>
      </div>

      <h6 className="mb-3">{selectedThread.subject}</h6>

      <div className="chat-messages bg-transparent" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
        {loading && messages.length === 0 && (
          <div className="text-muted small mb-2">Loading messages…</div>
        )}

        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            className={`d-flex mb-3 ${
              msg.sender === 'admin' ? 'justify-content-end' : 'justify-content-start'
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {msg.sender === 'user' && (
              <Image
                src="/user-avatar.png"
                alt="User"
                width={32}
                height={32}
                className="rounded-circle me-2"
              />
            )}

            <div className={`p-2 ${msg.sender === 'admin' ? 'chat-message-admin' : 'chat-message-user'}`}>
              <div className="small">{msg.content}</div>
              <div className="text-muted small mt-1">{msg.timestamp}</div>
            </div>

            {msg.sender === 'admin' && (
              <Image
                src="/admin-avatar.png"
                alt="Admin"
                width={32}
                height={32}
                className="rounded-circle ms-2"
              />
            )}
          </motion.div>
        ))}
      </div>

      <div className="chat-input d-flex gap-2 mt-2">
        <input
          type="text"
          className="form-control"
          placeholder="Type a message…"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button className="btn btn-sm btn-primary" onClick={handleSendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}


/*

'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { MessageThread, UIMessage } from './types';

// --- API shape from backend ---
type ApiMessage = {
  id: string;
  conversation_id: string;
  sender_role: 'admin' | 'user';
  body: string;
  created_at: string;
  read_by_user_at: string | null;
  read_by_admin_at: string | null;
};

// --- minimal API helper (same as profile side) ---
const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init.headers || {}),
  };
  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}: ${text || 'Request failed'}`);
  }
  return res.json();
}

type Props = {
  selectedThread: MessageThread;
  onDeleteThread?: (threadId: string) => void;
  onDeleteAllThreads?: () => void;
  onActivity?: () => void; // optional: refresh inbox counters
};

export default function AdminChatWindow({
  selectedThread,
  onDeleteThread,
  onDeleteAllThreads,
  onActivity,
}: Props) {
  const [conversationId, setConversationId] = useState<string | undefined>(selectedThread.id);
  const [messages, setMessages] = useState<UIMessage[]>(selectedThread.messages ?? []);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Load + mark read for admin
  useEffect(() => {
    let abort = false;

    async function load() {
      if (!conversationId) return;
      setLoading(true);
      try {
        const data = await api<ApiMessage[]>(
          `/api/messages/conversations/${conversationId}/messages?limit=30`
        );
        if (abort) return;

        const mapped: UIMessage[] = data.map((m) => ({
          id: m.id,
          sender: m.sender_role,
          content: m.body,
          timestamp: new Date(m.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        }));
        setMessages(mapped);

        // mark read (admin perspective)
        await api<{ ok: boolean; read_at: string }>(
          `/api/messages/conversations/${conversationId}/read`,
          { method: 'POST' }
        );
        onActivity?.();
      } catch (e) {
        console.error(e);
      } finally {
        if (!abort) setLoading(false);
      }
    }

    load();
    return () => {
      abort = true;
    };
  }, [conversationId, onActivity]);

  // Sync when parent changes threads
  useEffect(() => {
    setConversationId(selectedThread.id);
    setMessages(selectedThread.messages ?? []);
  }, [selectedThread]);

  // Admin send
  const handleSendMessage = async () => {
    const body = newMessage.trim();
    if (!body) return;

    try {
      const payload =
        conversationId
          ? { conversation_id: conversationId, body }
          : selectedThread.user_id
          ? { user_id: selectedThread.user_id, body }
          : null;

      if (!payload) {
        console.error('Missing conversation_id and user_id; cannot send.');
        return;
      }

      const created = await api<ApiMessage>(`/api/messages/send`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!conversationId) setConversationId(created.conversation_id);

      setMessages((prev) => [
        ...prev,
        {
          id: created.id,
          sender: created.sender_role,
          content: created.body,
          timestamp: new Date(created.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ]);

      setNewMessage('');
      onActivity?.();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteThread = () => {
    if (onDeleteThread && conversationId) onDeleteThread(conversationId);
  };

  const handleDeleteAll = () => onDeleteAllThreads?.();

  return (
    <div className="chat-window-wrapper p-3 rounded shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0">Conversation with {selectedThread.sender}</h6>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={handleDeleteThread}
            disabled={!conversationId}
          >
            🗑️ Delete
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={handleDeleteAll}>
            🧹 Delete All
          </button>
        </div>
      </div>

      <h6 className="mb-3">{selectedThread.subject}</h6>

      <div className="chat-messages bg-transparent" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
        {loading && messages.length === 0 && (
          <div className="text-muted small mb-2">Loading messages…</div>
        )}

        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            className={`d-flex mb-3 ${
              msg.sender === 'admin' ? 'justify-content-end' : 'justify-content-start'
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {msg.sender === 'user' && (
              <Image
                src="/user-avatar.png"
                alt="User"
                width={32}
                height={32}
                className="rounded-circle me-2"
              />
            )}

            <div
              className={`p-2 ${
                msg.sender === 'admin' ? 'chat-message-admin' : 'chat-message-user'
              }`}
            >
              <div className="small">{msg.content}</div>
              <div className="text-muted small mt-1">{msg.timestamp}</div>
            </div>

            {msg.sender === 'admin' && (
              <Image
                src="/admin-avatar.png"
                alt="Admin"
                width={32}
                height={32}
                className="rounded-circle ms-2"
              />
            )}
          </motion.div>
        ))}
      </div>

      <div className="chat-input d-flex gap-2 mt-2">
        <input
          type="text"
          className="form-control"
          placeholder="Type a message…"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button className="btn btn-sm btn-primary" onClick={handleSendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}



*/