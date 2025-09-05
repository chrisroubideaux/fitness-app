// components/profile/messages/ChatWindow.tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

type ApiMessage = {
  id: string;
  conversation_id: string;
  sender_role: 'admin' | 'user';
  body: string;
  created_at: string; // ISO Z
  read_by_user_at: string | null;
  read_by_admin_at: string | null;
};

type UIMessage = {
  id: string;
  sender: 'admin' | 'user';
  content: string;
  timestamp: string;
};

type ThreadProps = {
  id?: string;        // conversation_id
  admin_id?: string;  // target admin if no conversation yet
  sender: string;
  subject: string;
  messages?: UIMessage[];
};

type ApiConversation = {
  id: string;
  user_id: string;
  admin_id: string;
};

type Props = {
  selectedThread: ThreadProps;
  onDeleteThread?: (threadId: string) => void;
  onDeleteAllThreads?: () => void;
};

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

// User-side API helper (no cache + ts)
async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init.headers || {}),
  };
  const url = path.includes('?') ? `${path}&ts=${Date.now()}` : `${path}?ts=${Date.now()}`;
  const res = await fetch(`${BASE}${url}`, { cache: 'no-store', ...init, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}: ${text || 'Request failed'}`);
  }
  return res.json();
}

export default function ChatWindow({ selectedThread, onDeleteThread, onDeleteAllThreads }: Props) {
  const [conversationId, setConversationId] = useState<string | undefined>(selectedThread.id);
  const [messages, setMessages] = useState<UIMessage[]>(selectedThread.messages ?? []);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const toUi = (data: ApiMessage[]): UIMessage[] =>
    data.map((m) => ({
      id: m.id,
      sender: m.sender_role,
      content: m.body,
      timestamp: fmtTime(m.created_at),
    }));

  // 1) Ensure we HAVE a conversation id (admin may have messaged first).
  useEffect(() => {
    let abort = false;

    async function ensureConversationId() {
      if (conversationId) return;

      if (selectedThread.id) {
        setConversationId(selectedThread.id);
        return;
      }

      if (!selectedThread.admin_id) return;

      try {
        // User endpoint: POST admin_id → get/create conv id
        const conv = await api<ApiConversation>(`/api/messages/conversations`, {
          method: 'POST',
          body: JSON.stringify({ admin_id: selectedThread.admin_id }),
        });
        if (abort) return;
        setConversationId(conv.id);
      } catch (e) {
        console.error('❌ Failed to ensure conversation id (user):', e);
      }
    }

    ensureConversationId();
    return () => {
      abort = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedThread.id, selectedThread.admin_id]);

  // 2) Load messages whenever we have a conversation id, then mark read (user).
  useEffect(() => {
    let abort = false;

    async function load() {
      if (!conversationId) return;
      setLoading(true);
      try {
        const data = await api<ApiMessage>(`/api/messages/conversations/${conversationId}/messages?limit=50`);
        if (abort) return;
        setMessages(toUi(Array.isArray(data) ? data : []));
        await api<{ ok: boolean; read_at?: string }>(`/api/messages/conversations/${conversationId}/read`, {
          method: 'POST',
        });
      } catch (e) {
        console.error('❌ Load messages failed (user):', e);
      } finally {
        if (!abort) setLoading(false);
      }
    }

    load();
    return () => {
      abort = true;
    };
  }, [conversationId]);

  // 3) When parent switches threads, sync local state immediately (UI snappiness),
  //    then effects above resolve id and fetch fresh messages.
  useEffect(() => {
    setConversationId(selectedThread.id);
    setMessages(selectedThread.messages ?? []);
  }, [selectedThread]);

  // Send (user)
  const handleSendMessage = useCallback(async () => {
    const body = newMessage.trim();
    if (!body) return;

    try {
      setBusy(true);

      const payload =
        conversationId
          ? { conversation_id: conversationId, body }
          : selectedThread.admin_id
          ? { admin_id: selectedThread.admin_id, body }
          : null;

      if (!payload) {
        console.error('Missing conversation_id/admin_id; cannot send.');
        setBusy(false);
        return;
      }

      const created = await api<ApiMessage>(`/api/messages/send`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!conversationId) setConversationId(created.conversation_id);

      setMessages((prev) => [
        ...prev,
        { id: created.id, sender: created.sender_role, content: created.body, timestamp: fmtTime(created.created_at) },
      ]);

      setNewMessage('');
    } catch (e) {
      console.error('❌ Send failed (user):', e);
      alert('Failed to send message.');
    } finally {
      setBusy(false);
    }
  }, [conversationId, newMessage, selectedThread.admin_id]);

  // Hide this conversation from MY inbox (soft-delete)
  const handleDeleteThread = useCallback(async () => {
    if (!conversationId) return;
    if (!confirm('Remove this conversation from your inbox?')) return;

    try {
      await api<{ ok: boolean }>(`/api/messages/conversations/${conversationId}?for=me`, { method: 'DELETE' });
      onDeleteThread?.(conversationId);
      setMessages([]);
      setConversationId(undefined);
      setNewMessage('');
    } catch (e) {
      console.error('❌ Delete conversation failed (user):', e);
      alert('Failed to delete conversation.');
    }
  }, [conversationId, onDeleteThread]);

  // Hide ALL conversations from my inbox
  const handleDeleteAll = useCallback(async () => {
    if (!confirm('Remove ALL conversations from your inbox?')) return;

    try {
      const convos: Array<{ id: string }> = await api(`/api/messages/conversations?limit=200`);
      await Promise.all(
        convos.map((c) =>
          api(`/api/messages/conversations/${c.id}?for=me`, { method: 'DELETE' }).catch((e) =>
            console.error('Delete failed for', c.id, e)
          )
        )
      );
      onDeleteAllThreads?.();
      setMessages([]);
      setConversationId(undefined);
      setNewMessage('');
    } catch (e) {
      console.error('❌ Delete all conversations failed (user):', e);
      alert('Failed to delete all conversations.');
    }
  }, [onDeleteAllThreads]);

  return (
    <div className="chat-window-wrapper p-3 rounded shadow-sm">
      {/* Header with Delete + Delete All */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0">Conversation with {selectedThread.sender}</h6>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={handleDeleteThread}
            disabled={!conversationId || busy}
            title={!conversationId ? 'No conversation yet' : 'Hide this conversation from my inbox'}
          >
            🗑️ Delete
          </button>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={handleDeleteAll}
            disabled={busy}
            title="Hide ALL conversations from my inbox"
          >
            🧹 Delete All
          </button>
        </div>
      </div>

      <h6 className="mb-3">{selectedThread.subject}</h6>

      {/* Messages */}
      <div className="chat-messages bg-transparent" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
        {loading && messages.length === 0 && <div className="text-muted small mb-2">Loading messages…</div>}

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
              <Image src="/user-avatar.png" alt="You" width={32} height={32} className="rounded-circle ms-2" />
            )}
          </motion.div>
        ))}

        {!loading && messages.length === 0 && (
          <div className="text-muted small">No messages yet. Start the conversation below.</div>
        )}
      </div>

      {/* Composer */}
      <div className="chat-input d-flex gap-2 mt-2">
        <input
          type="text"
          className="form-control"
          placeholder="Type a message…"
          value={newMessage}
          disabled={busy || (!conversationId && !selectedThread.admin_id)}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !busy && handleSendMessage()}
        />
        <button className="btn btn-sm btn-primary" onClick={handleSendMessage} disabled={busy}>
          {busy ? 'Sending…' : 'Send'}
        </button>
      </div>
    </div>
  );
}




/*
// components/profile/messages/ChatWindow.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

type ApiMessage = {
  id: string;
  conversation_id: string;
  sender_role: 'admin' | 'user';
  body: string;
  created_at: string;
  read_by_user_at: string | null;
  read_by_admin_at: string | null;
};

// UI message shape (mapped from the API)
type Message = {
  id: string;
  sender: 'admin' | 'user';
  content: string;
  timestamp: string;
};

type Props = {
  selectedThread: {
   
    id?: string;
  
    admin_id?: string;
    sender: string;
    subject: string;
    messages?: Message[];
  };
  onDeleteThread?: (threadId: string) => void;
  onDeleteAllThreads?: () => void;
};

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

// minimal API helper (reads Bearer token from localStorage)
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

export default function ChatWindow({
  selectedThread,
  onDeleteThread,
  onDeleteAllThreads,
}: Props) {
  // If a conversation already exists, we’ll start with that ID.
  // If not, we’ll set it after first send using admin_id → server creates/fetches conv.
  const [conversationId, setConversationId] = useState<string | undefined>(selectedThread.id);
  const [messages, setMessages] = useState<Message[]>(selectedThread.messages ?? []);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Load + mark read whenever conversationId changes (and exists)
  useEffect(() => {
    let aborted = false;

    async function load() {
      if (!conversationId) return;

      setLoading(true);
      try {
        // 1) fetch messages
        const data = await api<ApiMessage[]>(
          `/api/messages/conversations/${conversationId}/messages?limit=30`
        );
        if (aborted) return;

        const mapped: Message[] = data.map((m) => ({
          id: m.id,
          sender: m.sender_role,
          content: m.body,
          timestamp: new Date(m.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        }));
        setMessages(mapped);

        // 2) mark read (user perspective) once messages are shown
        await api<{ ok: boolean; read_at: string }>(
          `/api/messages/conversations/${conversationId}/read`,
          { method: 'POST' }
        );
      } catch (err) {
        // You can surface a toast here if desired
        console.error(err);
      } finally {
        if (!aborted) setLoading(false);
      }
    }

    load();
    return () => {
      aborted = true;
    };
  }, [conversationId]);

  // If parent changes thread (new conversation or brand new admin target), sync local state
  useEffect(() => {
    setConversationId(selectedThread.id);
    setMessages(selectedThread.messages ?? []);
  }, [selectedThread]);

  // Send message:
  // - If we have conversationId → use { conversation_id, body }
  // - Else if we only have admin_id → use { admin_id, body } (server creates/fetches the conversation)
  const handleSendMessage = async () => {
    const body = newMessage.trim();
    if (!body) return;

    try {
      // Prefer existing conversation
      const payload =
        conversationId
          ? { conversation_id: conversationId, body }
          : selectedThread.admin_id
            ? { admin_id: selectedThread.admin_id, body }
            : null;

      if (!payload) {
        console.error('Missing conversation_id and admin_id; cannot send.');
        return;
      }

      const created = await api<ApiMessage>(`/api/messages/send`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

    
      if (!conversationId) {
        setConversationId(created.conversation_id);
      }

      // Append to UI
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
    } catch (err) {
      console.error(err);
      // optional: show toast
    }
  };

  const handleDeleteThread = () => {
    if (onDeleteThread && conversationId) {
      onDeleteThread(conversationId);
    }
  };

  const handleDeleteAll = () => {
    if (onDeleteAllThreads) onDeleteAllThreads();
  };

  return (
    <div className="chat-window-wrapper p-3 rounded shadow-sm">
    
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0">
          Conversation with {selectedThread.sender}
        </h6>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={handleDeleteThread}
            disabled={!conversationId}
            title={!conversationId ? 'No conversation yet' : 'Delete conversation'}
          >
            🗑️ Delete
          </button>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={handleDeleteAll}
          >
            🧹 Delete All
          </button>
        </div>
      </div>

      <h6 className="mb-3">{selectedThread.subject}</h6>

      <div
        className="chat-messages bg-transparent"
        style={{ maxHeight: '65vh', overflowY: 'auto' }}
      >
        {loading && messages.length === 0 && (
          <div className="text-muted small mb-2">Loading messages…</div>
        )}

        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            className={`d-flex mb-3 ${
              msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'
            }`}
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
            <div
              className={`p-2 ${
                msg.sender === 'user' ? 'chat-message-user' : 'chat-message-admin'
              }`}
            >
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

      <div className="chat-input d-flex gap-2 mt-2">
        <input
          type="text"
          className="form-control"
          placeholder="Type a message..."
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