// components/admin/messages/ChatWindow.tsx
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { MessageThread, UIMessage } from './types';

type ApiMessage = {
  id: string;
  conversation_id: string;
  sender_role: 'admin' | 'user';
  body: string;
  created_at: string; // ISO string with Z
  read_by_user_at: string | null;
  read_by_admin_at: string | null;
};

type ApiListOk = { ok: boolean; read_at?: string };

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

// ------- Admin-side API helper -------
async function adminApi<T>(path: string, init: RequestInit = {}): Promise<T> {
  const ls = typeof window !== 'undefined' ? window.localStorage : null;
  const token =
    (ls?.getItem('adminToken')?.trim() ||
      ls?.getItem('token')?.trim() ||
      ls?.getItem('admin_token')?.trim()) ?? '';

  const mergedHeaders: HeadersInit =
    typeof init.headers === 'undefined'
      ? { 'Content-Type': 'application/json' }
      : init.headers instanceof Headers
      ? init.headers
      : { 'Content-Type': 'application/json', ...(init.headers as Record<string, string>) };

  const headers: HeadersInit = token
    ? {
        ...(mergedHeaders as Record<string, string>),
        Authorization: `Bearer ${token}`,
      }
    : mergedHeaders;

  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  const raw = await res.text().catch(() => '');

  if (!res.ok) {
    console.error(`[adminApi] ${res.status} ${res.statusText} →`, raw || '(no body)');
    throw new Error(`${res.status} ${res.statusText}: ${raw || 'Request failed'}`);
  }

  if (!raw) return {} as T;
  try {
    return JSON.parse(raw) as T;
  } catch {
    console.warn('[adminApi] Non-JSON response:', raw);
    return {} as T;
  }
}

// ------- Props -------
type Props = {
  selectedThread: MessageThread;
  onDeleteThread?: (threadId: string) => void;
  onDeleteAllThreads?: () => void;
  onActivity?: () => void;
};

// ------- Component -------
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
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const endRef = useRef<HTMLDivElement | null>(null);

  const fmtTime = useCallback(
    (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    []
  );

  const toUi = useCallback(
    (data: ApiMessage[]): UIMessage[] =>
      data.map((m) => ({
        id: m.id,
        sender: m.sender_role,
        content: m.body,
        timestamp: fmtTime(m.created_at),
      })),
    [fmtTime]
  );

  // Scroll bottom
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load messages + mark read
  useEffect(() => {
    let abort = false;
    async function load() {
      if (!conversationId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await adminApi<ApiMessage[]>(
          `/api/messages/conversations/${conversationId}/messages?limit=50`
        );
        if (abort) return;
        setMessages(toUi(data));

        // Mark read
        await adminApi<ApiListOk>(`/api/messages/conversations/${conversationId}/read`, {
          method: 'POST',
        });

        onActivity?.();
      } catch (e: unknown) {
        const msg = errorMessage(e);
        console.error('❌ Load messages failed (admin):', msg);
        if (!abort) setError(msg || 'Failed to load messages');
      } finally {
        if (!abort) setLoading(false);
      }
    }
    load();
    return () => {
      abort = true;
    };
  }, [conversationId, toUi, onActivity]);

  useEffect(() => {
    setConversationId(selectedThread.id);
    setMessages(selectedThread.messages ?? []);
  }, [selectedThread]);

  const canSend = useMemo(
    () => newMessage.trim().length > 0 && !sending,
    [newMessage, sending]
  );

  const handleSendMessage = useCallback(async () => {
    const body = newMessage.trim();
    if (!body || sending) return;

    type SendPayload = { conversation_id: string; body: string } | { user_id: string; body: string };
    const payload: SendPayload | null = conversationId
      ? { conversation_id: conversationId, body }
      : selectedThread.user_id
      ? { user_id: selectedThread.user_id, body }
      : null;

    if (!payload) {
      setError('Missing conversation_id and user_id; cannot send.');
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const optimistic: UIMessage = {
      id: tempId,
      sender: 'admin',
      content: body,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    try {
      setSending(true);
      setError(null);
      setMessages((prev) => [...prev, optimistic]);
      setNewMessage('');

      const created = await adminApi<ApiMessage>(`/api/messages/send`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!conversationId) {
        setConversationId(created.conversation_id);
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId
            ? {
                id: created.id,
                sender: created.sender_role,
                content: created.body,
                timestamp: fmtTime(created.created_at),
              }
            : m
        )
      );

      onActivity?.();
    } catch (e: unknown) {
      const msg = errorMessage(e);
      console.error('❌ Send failed (admin):', msg);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setError(msg || 'Failed to send message');
    } finally {
      setSending(false);
    }
  }, [conversationId, fmtTime, newMessage, selectedThread.user_id, onActivity, sending]);

  // ✅ Delete one conversation
  const handleDeleteThread = useCallback(async () => {
    if (!conversationId) return;
    if (!confirm('Hide this conversation for admin?')) return;

    try {
      await adminApi<{ ok: boolean }>(`/api/messages/conversations/${conversationId}?for=me`, {
        method: 'DELETE',
      });
      onDeleteThread?.(conversationId);
      setMessages([]);
      setConversationId(undefined);
      setNewMessage('');
    } catch (e: unknown) {
      const msg = errorMessage(e);
      console.error('❌ Delete conversation failed (admin):', msg);
      setError('Failed to delete conversation.');
    }
  }, [conversationId, onDeleteThread]);

  // ✅ Delete all conversations
  const handleDeleteAll = useCallback(async () => {
    if (!confirm('Hide ALL conversations for admin?')) return;

    try {
      const convos: Array<{ id: string }> = await adminApi(`/api/messages/conversations?limit=200`);
      await Promise.all(
        convos.map((c) =>
          adminApi(`/api/messages/conversations/${c.id}?for=me`, { method: 'DELETE' }).catch((e) =>
            console.error('Delete failed for', c.id, e)
          )
        )
      );
      onDeleteAllThreads?.();
      setMessages([]);
      setConversationId(undefined);
      setNewMessage('');
    } catch (e: unknown) {
      const msg = errorMessage(e);
      console.error('❌ Delete all failed (admin):', msg);
      setError('Failed to delete all conversations.');
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
            disabled={!conversationId}
          >
            🗑️ Delete
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={handleDeleteAll}>
            🧹 Delete All
          </button>
        </div>
      </div>

      {selectedThread.subject && <h6 className="mb-3">{selectedThread.subject}</h6>}

      {error && (
        <div className="alert alert-warning py-2 px-3 mb-2" role="alert">
          {error}
        </div>
      )}

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

        {!loading && messages.length === 0 && !error && (
          <div className="text-muted small">No messages yet. Start the conversation below.</div>
        )}

        <div ref={endRef} />
      </div>

      <div className="chat-input d-flex gap-2 mt-2">
        <input
          type="text"
          className="form-control"
          placeholder={sending ? 'Sending…' : 'Type a message…'}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && canSend && handleSendMessage()}
          disabled={sending}
        />
        <button className="btn btn-sm btn-primary" onClick={handleSendMessage} disabled={!canSend}>
          Send
        </button>
      </div>
    </div>
  );
}




/*


// components/admin/messages/ChatWindow.tsx
// components/admin/messages/ChatWindow.tsx
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { MessageThread, UIMessage } from './types';

type ApiMessage = {
  id: string;
  conversation_id: string;
  sender_role: 'admin' | 'user';
  body: string;
  created_at: string; // ISO string with Z
  read_by_user_at: string | null;
  read_by_admin_at: string | null;
};

type ApiListOk = { ok: boolean; read_at?: string };

// ------- Utilities -------

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

async function adminApi<T>(path: string, init: RequestInit = {}): Promise<T> {
  const ls = typeof window !== 'undefined' ? window.localStorage : null;
  const token =
    (ls?.getItem('adminToken')?.trim() ||
      ls?.getItem('token')?.trim() ||
      ls?.getItem('admin_token')?.trim()) ?? '';

  // Debug token presence (first 16 chars)
  // eslint-disable-next-line no-console
  console.debug(
    '[adminApi] token present?',
    Boolean(token),
    token ? token.slice(0, 16) + '…' : '(none)'
  );

  const mergedHeaders: HeadersInit =
    typeof init.headers === 'undefined'
      ? { 'Content-Type': 'application/json' }
      : init.headers instanceof Headers
      ? init.headers
      : { 'Content-Type': 'application/json', ...(init.headers as Record<string, string>) };

  const headers: HeadersInit =
    token
      ? {
          ...(mergedHeaders as Record<string, string>),
          Authorization: `Bearer ${token}`,
        }
      : mergedHeaders;

  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  const raw = await res.text().catch(() => '');

  if (!res.ok) {
    // eslint-disable-next-line no-console
    console.error(`[adminApi] ${res.status} ${res.statusText} →`, raw || '(no body)');
    throw new Error(`${res.status} ${res.statusText}: ${raw || 'Request failed'}`);
  }

  if (!raw) return {} as T;

  try {
    return JSON.parse(raw) as T;
  } catch {
    // eslint-disable-next-line no-console
    console.warn('[adminApi] Non-JSON response:', raw);
    return {} as T;
  }
}

// ------- Props -------

type Props = {
  selectedThread: MessageThread;
  onDeleteThread?: (threadId: string) => void;
  onDeleteAllThreads?: () => void;
  onActivity?: () => void;
};

// ------- Component -------

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
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const endRef = useRef<HTMLDivElement | null>(null);

  const fmtTime = useCallback(
    (iso: string) =>
      new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    []
  );

  // Convert ApiMessage[] -> UIMessage[]
  const toUi = useCallback(
    (data: ApiMessage[]): UIMessage[] =>
      data.map((m) => ({
        id: m.id,
        sender: m.sender_role,
        content: m.body,
        timestamp: fmtTime(m.created_at),
      })),
    [fmtTime]
  );

  // Smooth scroll to bottom when messages change
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 🔍 One-time probe: verify Authorization is being sent
  useEffect(() => {
    (async () => {
      try {
        const me = await adminApi<{ id: string; email: string; role: string }>('/api/admins/me');
        // eslint-disable-next-line no-console
        console.log('[probe:/api/admins/me] ok →', me);
      } catch (e: unknown) {
        // eslint-disable-next-line no-console
        console.error('[probe:/api/admins/me] failed →', e);
        setError('Auth probe failed. Is adminToken set in localStorage?');
      }
    })();
  }, []);

  // Load messages + mark read (admin)
  useEffect(() => {
    let abort = false;

    async function load() {
      if (!conversationId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await adminApi<ApiMessage[]>(
          `/api/messages/conversations/${conversationId}/messages?limit=50`
        );
        if (abort) return;

        setMessages(toUi(data));

        // Mark read (admin)
        await adminApi<ApiListOk>(`/api/messages/conversations/${conversationId}/read`, {
          method: 'POST',
        });

        onActivity?.();
      } catch (e: unknown) {
        const msg = errorMessage(e);
        // eslint-disable-next-line no-console
        console.error('❌ Load messages failed (admin):', msg);
        if (!abort) setError(msg || 'Failed to load messages');
      } finally {
        if (!abort) setLoading(false);
      }
    }

    load();
    return () => {
      abort = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, toUi]);

  // When parent switches threads (from Inbox)
  useEffect(() => {
    setConversationId(selectedThread.id);
    setMessages(selectedThread.messages ?? []);
  }, [selectedThread]);

  // Disable send conditions
  const canSend = useMemo(
    () => newMessage.trim().length > 0 && !sending,
    [newMessage, sending]
  );

  const handleSendMessage = useCallback(async () => {
    const body = newMessage.trim();
    if (!body || sending) return;

    type SendPayload =
      | { conversation_id: string; body: string }
      | { user_id: string; body: string };

    const payload: SendPayload | null = conversationId
      ? { conversation_id: conversationId, body }
      : selectedThread.user_id
      ? { user_id: selectedThread.user_id, body }
      : null;

    if (!payload) {
      setError('Missing conversation_id and user_id; cannot send.');
      return;
    }

    // Optimistic append (temporary ID)
    const tempId = `temp-${Date.now()}`;
    const optimistic: UIMessage = {
      id: tempId,
      sender: 'admin',
      content: body,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    try {
      setSending(true);
      setError(null);
      setMessages((prev) => [...prev, optimistic]);
      setNewMessage('');

      const created = await adminApi<ApiMessage>(`/api/messages/send`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      // If this was a brand-new conversation, store its ID
      if (!conversationId) {
        setConversationId(created.conversation_id);
      }

      // Replace optimistic with server-confirmed message
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId
            ? {
                id: created.id,
                sender: created.sender_role,
                content: created.body,
                timestamp: fmtTime(created.created_at),
              }
            : m
        )
      );

      onActivity?.();
    } catch (e: unknown) {
      const msg = errorMessage(e);
      // eslint-disable-next-line no-console
      console.error('❌ Send failed (admin):', msg);

      // Roll back optimistic
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setError(msg || 'Failed to send message');
    } finally {
      setSending(false);
    }
  }, [conversationId, fmtTime, newMessage, selectedThread.user_id, onActivity, sending]);

  const handleDeleteThread = useCallback(() => {
    if (onDeleteThread && conversationId) onDeleteThread(conversationId);
  }, [conversationId, onDeleteThread]);

  const handleDeleteAll = useCallback(() => onDeleteAllThreads?.(), [onDeleteAllThreads]);

  return (
    <div className="chat-window-wrapper p-3 rounded shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0">Conversation with {selectedThread.sender}</h6>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={handleDeleteThread}
            disabled={!conversationId}
            aria-disabled={!conversationId}
          >
            🗑️ Delete
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={handleDeleteAll}>
            🧹 Delete All
          </button>
        </div>
      </div>

      {selectedThread.subject && <h6 className="mb-3">{selectedThread.subject}</h6>}

      {error && (
        <div className="alert alert-warning py-2 px-3 mb-2" role="alert">
          {error}
        </div>
      )}

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

        {!loading && messages.length === 0 && !error && (
          <div className="text-muted small">No messages yet. Start the conversation below.</div>
        )}

        <div ref={endRef} />
      </div>

      <div className="chat-input d-flex gap-2 mt-2">
        <input
          type="text"
          className="form-control"
          placeholder={sending ? 'Sending…' : 'Type a message…'}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && canSend && handleSendMessage()}
          disabled={sending}
          aria-disabled={sending}
        />
        <button className="btn btn-sm btn-primary" onClick={handleSendMessage} disabled={!canSend}>
          Send
        </button>
      </div>
    </div>
  );
}


/*


*/