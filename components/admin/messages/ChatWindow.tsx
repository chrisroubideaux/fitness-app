// components/admin/messages/ChatWindow.tsx
// components/admin/messages/ChatWindow.tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { MessageThread, UIMessage } from './types';

type ApiMessage = {
  id: string;
  conversation_id: string;
  sender_role: 'admin' | 'user';
  body: string;
  created_at: string;            // ISO Z
  read_by_user_at: string | null;
  read_by_admin_at: string | null;
};

type ApiListOk = { ok: boolean; read_at?: string };

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

// --- Small API helper (uses adminToken) ---
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
  selectedThread: MessageThread;           // Must include .id when opening existing convos
  onDeleteThread?: (threadId: string) => void;
  onDeleteAllThreads?: () => void;
  onActivity?: () => void;                 // e.g. to refresh inbox counters
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
  const [busy, setBusy] = useState(false);

  const fmtTime = (iso: string) =>
    new Date(iso).toLocaleString([], { hour: '2-digit', minute: '2-digit' });

  // Convert ApiMessage[] -> UIMessage[]
  const toUi = (data: ApiMessage[]): UIMessage[] =>
    data.map((m) => ({
      id: m.id,
      sender: m.sender_role,
      content: m.body,
      timestamp: fmtTime(m.created_at),
    }));

  // Load messages + mark read (admin)
  useEffect(() => {
    let abort = false;

    async function load() {
      if (!conversationId) return;
      setLoading(true);
      try {
        const data = await api<ApiMessage[]>(
          `/api/messages/conversations/${conversationId}/messages?limit=50`
        );
        if (abort) return;

        setMessages(toUi(data));

        // Mark read as admin (resets unread counter)
        await api<ApiListOk>(`/api/messages/conversations/${conversationId}/read`, {
          method: 'POST',
        });
        onActivity?.();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  // When parent switches threads (from Inbox)
  useEffect(() => {
    setConversationId(selectedThread.id);
    setMessages(selectedThread.messages ?? []);
  }, [selectedThread]);

  // --- Send ---
  const handleSendMessage = useCallback(async () => {
    const body = newMessage.trim();
    if (!body) return;

    try {
      setBusy(true);

      const payload =
        conversationId
          ? { conversation_id: conversationId, body }
          : selectedThread.user_id
          ? { user_id: selectedThread.user_id, body }
          : null;

      if (!payload) {
        console.error('Missing conversation_id and user_id; cannot send.');
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
        {
          id: created.id,
          sender: created.sender_role,
          content: created.body,
          timestamp: fmtTime(created.created_at),
        },
      ]);

      setNewMessage('');
      onActivity?.();
    } catch (e) {
      console.error('❌ Send failed:', e);
      alert('Failed to send message.');
    } finally {
      setBusy(false);
    }
  }, [conversationId, newMessage, selectedThread.user_id, onActivity]);

  // --- Delete a single message ---
  const handleDeleteMessage = useCallback(
    async (messageId: string) => {
      if (!conversationId) return;
      if (!confirm('Delete this message?')) return;

      try {
        await api<{ ok: true } | ApiMessage>(`/api/messages/messages/${messageId}`, {
          method: 'DELETE',
        });

        setMessages((prev) => prev.filter((m) => m.id !== messageId));
        onActivity?.();
      } catch (e) {
        console.error('❌ Delete message failed:', e);
        alert('Failed to delete message.');
      }
    },
    [conversationId, onActivity]
  );

  // --- Delete current conversation ---
  const handleDeleteThread = useCallback(async () => {
    if (!conversationId) return;
    if (!confirm('Delete this entire conversation?')) return;

    try {
      await api<{ ok: boolean }>(`/api/messages/conversations/${conversationId}`, {
        method: 'DELETE',
      });

      onDeleteThread?.(conversationId);

      setConversationId(undefined);
      setMessages([]);
      setNewMessage('');
    } catch (e) {
      console.error('❌ Delete conversation failed:', e);
      alert('Failed to delete conversation.');
    }
  }, [conversationId, onDeleteThread]);

  // --- Delete all conversations for this admin ---
  const handleDeleteAll = useCallback(async () => {
    if (!confirm('Delete ALL conversations for this admin?')) return;

    try {
      const convos: Array<{ id: string }> = await api(`/api/messages/conversations?limit=200`);
      await Promise.all(
        convos.map((c) =>
          api(`/api/messages/conversations/${c.id}`, { method: 'DELETE' }).catch((e) =>
            console.error('Delete failed for', c.id, e)
          )
        )
      );

      onDeleteAllThreads?.();

      setConversationId(undefined);
      setMessages([]);
      setNewMessage('');
    } catch (e) {
      console.error('❌ Delete all conversations failed:', e);
      alert('Failed to delete all conversations.');
    }
  }, [onDeleteAllThreads]);

  return (
    <div className="chat-window-wrapper p-3 rounded shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0">Conversation with {selectedThread.sender}</h6>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={handleDeleteThread}
            disabled={!conversationId || busy}
            title="Delete this conversation"
          >
            🗑️ Delete
          </button>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={handleDeleteAll}
            disabled={busy}
            title="Delete all conversations"
          >
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
            className={`d-flex mb-3 ${msg.sender === 'admin' ? 'justify-content-end' : 'justify-content-start'}`}
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
              className={`p-2 position-relative ${
                msg.sender === 'admin' ? 'chat-message-admin' : 'chat-message-user'
              }`}
            >
              <div className="small">{msg.content}</div>
              <div className="text-muted small mt-1">{msg.timestamp}</div>

              <button
                className="btn btn-sm btn-link text-danger position-absolute"
                style={{
                  right: msg.sender === 'admin' ? -6 : 'auto',
                  left: msg.sender === 'user' ? -6 : 'auto',
                  top: -8,
                  textDecoration: 'none',
                }}
                onClick={() => handleDeleteMessage(msg.id)}
                title="Delete message"
              >
                🗑️
              </button>
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
          disabled={busy || (!conversationId && !selectedThread.user_id)}
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


*/