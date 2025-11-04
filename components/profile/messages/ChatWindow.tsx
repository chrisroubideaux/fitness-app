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
  created_at: string | null;
  read_by_user_at: string | null;
  read_by_admin_at: string | null;
  is_toxic?: boolean;
  toxicity_score?: number;
};

type UIMessage = {
  id: string;
  sender: 'admin' | 'user';
  content: string;
  timestamp: string;
  is_toxic?: boolean;
  toxicity_score?: number;
};

type ThreadProps = {
  id?: string;
  admin_id?: string;
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

// 🔧 Helper for API calls
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

// ✅ Safe date formatter to prevent "Invalid Date"
const fmtTime = (iso?: string | null) => {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

export default function ChatWindow({ selectedThread, onDeleteThread, onDeleteAllThreads }: Props) {
  const [conversationId, setConversationId] = useState<string | undefined>(selectedThread.id);
  const [messages, setMessages] = useState<UIMessage[]>(selectedThread.messages ?? []);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  const toUi = (data: ApiMessage[]): UIMessage[] =>
    data.map((m) => ({
      id: m.id,
      sender: m.sender_role,
      content: m.body,
      timestamp: fmtTime(m.created_at),
      is_toxic: m.is_toxic ?? false,
      toxicity_score: m.toxicity_score ?? 0,
    }));

  // Ensure conversation ID exists
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
        const conv = await api<ApiConversation>(`/api/messages/conversations`, {
          method: 'POST',
          body: JSON.stringify({ admin_id: selectedThread.admin_id }),
        });
        if (!abort) setConversationId(conv.id);
      } catch (e) {
        console.error('❌ Failed to ensure conversation id:', e);
      }
    }
    ensureConversationId();
    return () => {
      abort = true;
    };
  }, [selectedThread.id, selectedThread.admin_id, conversationId]);

  // Load messages
  useEffect(() => {
    let abort = false;
    async function load() {
      if (!conversationId) return;
      setLoading(true);
      try {
        const data = await api<ApiMessage[]>(`/api/messages/conversations/${conversationId}/messages?limit=50`);
        if (abort) return;
        setMessages(toUi(Array.isArray(data) ? data : []));
        await api<{ ok: boolean; read_at?: string }>(
          `/api/messages/conversations/${conversationId}/read`,
          { method: 'POST' }
        );
      } catch (e) {
        console.error('❌ Load messages failed:', e);
      } finally {
        if (!abort) setLoading(false);
      }
    }
    load();
    return () => {
      abort = true;
    };
  }, [conversationId]);

  // Sync thread switch
  useEffect(() => {
    setConversationId(selectedThread.id);
    setMessages(selectedThread.messages ?? []);
  }, [selectedThread]);

  // Send message
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

      const res = await fetch(`${BASE}/api/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(typeof window !== 'undefined' && localStorage.getItem('authToken')
            ? { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
            : {}),
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 422) {
        const data = await res.json().catch(() => ({}));
        const reason = data?.error || 'Message blocked for toxicity.';
        alert(`⚠️ ${reason}`);
        setNewMessage('');
        setBusy(false);
        return;
      }

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`${res.status} ${res.statusText}: ${text || 'Request failed'}`);
      }

      const data = await res.json();
      const created = data.message ?? data;

      if (!conversationId) setConversationId(created.conversation_id);

      setMessages((prev) => [
        ...prev,
        {
          id: created.id || `${Date.now()}-${Math.random()}`,
          sender: created.sender_role,
          content: created.body,
          timestamp: fmtTime(created.created_at),
          is_toxic: created.is_toxic ?? false,
          toxicity_score: created.toxicity_score ?? 0,
        },
        ...(data.auto_reply
          ? [
              {
                id: data.auto_reply.id || `auto-${Date.now()}-${Math.random()}`,
                sender: data.auto_reply.sender_role,
                content: data.auto_reply.body,
                timestamp: fmtTime(data.auto_reply.created_at),
              },
            ]
          : []),
      ]);
      setNewMessage('');
    } catch (e) {
      console.error('❌ Send failed:', e);
      alert('Failed to send message.');
    } finally {
      setBusy(false);
    }
  }, [conversationId, newMessage, selectedThread.admin_id]);

  // Delete one
  const handleDeleteThread = useCallback(async () => {
    if (!conversationId) return;
    if (!confirm('Remove this conversation from your inbox?')) return;
    try {
      await api<{ ok: boolean }>(`/api/messages/conversations/${conversationId}?for=me`, {
        method: 'DELETE',
      });
      onDeleteThread?.(conversationId);
      setMessages([]);
      setConversationId(undefined);
      setNewMessage('');
    } catch (e) {
      console.error('❌ Delete conversation failed:', e);
      alert('Failed to delete conversation.');
    }
  }, [conversationId, onDeleteThread]);

  // Delete all
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
      console.error('❌ Delete all failed:', e);
      alert('Failed to delete all conversations.');
    }
  }, [onDeleteAllThreads]);

  return (
    <div className="chat-window-wrapper p-3 rounded shadow-lg">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0 fw-bold">Messages: {selectedThread.sender}</h6>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={handleDeleteThread}
            disabled={!conversationId || busy}
          >
            🗑️ Delete
          </button>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={handleDeleteAll}
            disabled={busy}
          >
            🧹 Delete All
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
        {loading && messages.length === 0 && (
          <div className="text-muted small mb-2">Loading messages…</div>
        )}

        {messages.map((msg, index) => (
          <motion.div
            key={msg.id || `msg-${index}-${msg.sender}-${msg.timestamp}`}
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
              className={`p-2 rounded-3 ${
                msg.sender === 'user' ? 'chat-message-user' : 'chat-message-admin'
              }`}
              style={{
                backgroundColor: msg.is_toxic
                  ? 'rgba(255, 0, 0, 0.1)'
                  : msg.sender === 'user'
                  ? 'rgba(0, 123, 255, 0.1)'
                  : 'rgba(255, 255, 255, 0.05)',
                border: msg.is_toxic ? '1px solid rgba(255,0,0,0.3)' : undefined,
              }}
            >
              <div className="small">
                {msg.is_toxic ? (
                  <span>
                    ⚠️ <em>Flagged for review</em>
                  </span>
                ) : (
                  msg.content
                )}
              </div>
              {msg.timestamp && (
                <div className="text-muted small mt-1">{msg.timestamp}</div>
              )}
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
    <div className="chat-window-wrapper p-3 rounded shadow-lg">
    
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0 fw-bold">Messages: {selectedThread.sender} </h6>
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
      <div className="chat-messages" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
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







*/