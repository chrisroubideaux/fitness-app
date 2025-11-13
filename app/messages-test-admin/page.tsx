// app/admin/messages-test/page.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchConversations,
  fetchMessages,
  markConversationRead,
  openOrCreateConversation,
  sendMessageThunk,
  setActiveConversation,
} from '@/store/slices/messagesSlice';
import type { UUID } from '@/store/api/messagesApi';

type User = {
  id: string;
  full_name?: string | null;
  email?: string | null;
  profile_image_url?: string | null;
};

export default function AdminMessagesPage() {
  const dispatch = useAppDispatch();

  const {
    conversations,
    activeConversationId,
    messagesByConv,
    loadingConvos,
    loadingMessages,
    sending,
    error,
  } = useAppSelector((s) => s.messages);

  const token = typeof window !== 'undefined'
    ? localStorage.getItem('authToken')
    : null;

  const [users, setUsers] = useState<User[]>([]);
  const [newUserId, setNewUserId] = useState('');
  const [draft, setDraft] = useState('');
  const scrollerRef = useRef<HTMLDivElement>(null);

  const activeMsgs = useMemo(
    () =>
      activeConversationId
        ? messagesByConv[activeConversationId] ?? []
        : [],
    [messagesByConv, activeConversationId]
  );

  // Load users (admins can start chat with a user)
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const base = (process.env.NEXT_PUBLIC_API_BASE_URL ??
          'http://localhost:5000').replace(/\/+$/, '');

        const res = await fetch(`${base}/api/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data: User[] = await res.json();
        setUsers(data);
      } catch {
        // ignore for testing
      }
    })();
  }, [token]);

  // Load conversations (admin inbox)
  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  // Load messages when selecting a conversation
  useEffect(() => {
    if (!activeConversationId) return;

    dispatch(
      fetchMessages({
        conversation_id: activeConversationId,
        limit: 30,
      })
    ).then(() => {
      dispatch(markConversationRead({ conversation_id: activeConversationId }));
    });
  }, [dispatch, activeConversationId]);

  // Autoscroll
  useEffect(() => {
    scrollerRef.current?.scrollTo({
      top: scrollerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [activeMsgs.length]);

  // Start convo (admin -> user)
  const handleStartChat = async () => {
    if (!newUserId) return;
    const action = await dispatch(
      openOrCreateConversation({
        user_id: newUserId,
        admin_id: undefined, // admin is current logged-in admin
      })
    );

    if (openOrCreateConversation.fulfilled.match(action)) {
      const id = action.payload.id as UUID;
      dispatch(setActiveConversation(id));
    }
  };

  const handleSend = async () => {
    if (!draft.trim()) return;

    await dispatch(
      sendMessageThunk({
        body: draft.trim(),
        conversation_id: activeConversationId ?? undefined,
        user_id: !activeConversationId ? newUserId || undefined : undefined,
      })
    );

    setDraft('');
  };

  return (
    <div className="container py-4">
      <h2 className="mb-3">👑 Admin Messages Test</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-3">
        {/* Conversations Sidebar */}
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-header d-flex align-items-center justify-content-between">
              <strong>Conversations</strong>
              {loadingConvos && <span className="small text-muted">Loading…</span>}
            </div>

            <div
              className="list-group list-group-flush"
              style={{ maxHeight: 420, overflowY: 'auto' }}
            >
              {conversations.map((c) => (
                <button
                  key={c.id}
                  className={`list-group-item list-group-item-action d-flex justify-content-between ${
                    activeConversationId === c.id ? 'active' : ''
                  }`}
                  onClick={() => dispatch(setActiveConversation(c.id))}
                >
                  <span>{c.peer_display_name || 'User'}</span>
                  {c.unread_count > 0 && (
                    <span className="badge bg-danger">{c.unread_count}</span>
                  )}
                </button>
              ))}

              {!loadingConvos && conversations.length === 0 && (
                <div className="list-group-item text-muted">
                  No conversations yet.
                </div>
              )}
            </div>

            {/* Admin starting a chat with a user */}
            <div className="card-body border-top">
              <label className="form-label">Start a new chat with a user:</label>
              <div className="d-flex gap-2">
                <select
                  className="form-select"
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value)}
                >
                  <option value="">Select user…</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name || u.email || u.id}
                    </option>
                  ))}
                </select>
                <button
                  className="btn btn-primary"
                  onClick={handleStartChat}
                  disabled={!newUserId}
                >
                  Start
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Thread / Chat Window */}
        <div className="col-md-8">
          <div className="card shadow-sm h-100">
            <div className="card-header d-flex align-items-center justify-content-between">
              <strong>Thread</strong>
              {loadingMessages && <span className="small text-muted">Loading…</span>}
            </div>

            <div
              ref={scrollerRef}
              className="card-body"
              style={{ height: 420, overflowY: 'auto' }}
            >
              {activeConversationId ? (
                activeMsgs.length > 0 ? (
                  activeMsgs.map((m) => (
                    <div
                      key={m.id}
                      className={`d-flex ${
                        m.sender_role === 'admin'
                          ? 'justify-content-end'
                          : 'justify-content-start'
                      } mb-2`}
                    >
                      <div
                        className={`p-2 rounded-3 ${
                          m.sender_role === 'admin'
                            ? 'bg-primary text-white'
                            : 'bg-light'
                        }`}
                        style={{ maxWidth: '70%' }}
                      >
                        <div className="small">{m.body}</div>
                        <div className="small text-muted mt-1">
                          {new Date(m.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-muted">No messages yet.</div>
                )
              ) : (
                <div className="text-muted">Select a conversation.</div>
              )}
            </div>

            {/* Send Box */}
            <div className="card-footer">
              <div className="input-group">
                <input
                  className="form-control"
                  placeholder="Type a message…"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  disabled={sending}
                />
                <button
                  className="btn btn-primary"
                  onClick={handleSend}
                  disabled={sending || !draft.trim()}
                >
                  {sending ? 'Sending…' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


{/*
// app/messages-test-admin/page.tsx

'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

// 🧩 Types
type User = {
  id: string;
  full_name?: string | null;
  email?: string | null;
};

type Conversation = {
  id: string;
  peer_display_name?: string | null;
};

type Message = {
  id: string;
  sender_role: 'admin' | 'user' | string;
  body: string;
  created_at: string;
};

// 🌐 Base URL
const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

// 🧠 Shared Admin API helper (safe JSON/text handler)
async function adminApi<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const token =
    localStorage.getItem('adminToken') ||
    localStorage.getItem('authToken') ||
    localStorage.getItem('token') ||
    localStorage.getItem('admin_token') ||
    '';

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(init.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  const text = await res.text().catch(() => '');

  if (!res.ok) {
    if (res.status === 401) {
      console.warn('⚠️ Session expired — redirecting to login.');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    throw new Error(text || `Request failed with ${res.status}`);
  }

  if (!text) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

export default function MessagesTestAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [newUserId, setNewUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  // 🧩 Load users + conversations on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await adminApi<User[]>(`/api/users`);
        setUsers(data);
      } catch (e) {
        console.error('❌ Failed to load users:', e);
      }
      await loadConversations();
    })();
  }, []);

  // 🔁 Load all conversations
  async function loadConversations() {
    try {
      const convos = await adminApi<Conversation[]>(`/api/messages/conversations`);
      setConversations(convos);
    } catch (e) {
      console.error('❌ Load conversations failed:', e);
    }
  }

  // 📨 Load messages for selected conversation
  async function loadMessages(convId: string) {
    try {
      setLoading(true);
      const data = await adminApi<Message[]>(
        `/api/messages/conversations/${convId}/messages?limit=50`
      );
      setMessages(data);
      await adminApi(`/api/messages/conversations/${convId}/read`, { method: 'POST' });
    } catch (e) {
      console.error('❌ Load messages failed:', e);
    } finally {
      setLoading(false);
    }
  }

  // 💬 Start new conversation
  async function startConversation() {
    if (!newUserId) return alert('Select a user first');
    try {
      const conv = await adminApi<{ id: string; peer_display_name?: string }>(
        `/api/messages/conversations`,
        {
          method: 'POST',
          body: JSON.stringify({ user_id: newUserId }),
        }
      );

      // update list and select it immediately
      setConversations((prev) => {
        const exists = prev.find((c) => c.id === conv.id);
        if (exists) return prev;
        return [...prev, conv];
      });

      setSelectedConv(conv.id);
      await loadMessages(conv.id);
    } catch (e) {
      console.error('❌ Start conversation failed:', e);
    }
  }

  // 🚀 Send message (creates conversation automatically if none exists)
  // 🚀 Send message (includes admin_id to prevent "Admin not found")
async function sendMessage() {
  if (!newMessage.trim()) return;

  let convId = selectedConv;
  const adminId =
    localStorage.getItem('adminId') ||
    localStorage.getItem('admin_id') ||
    ''; // ensure it's present

  try {
    // auto-start conversation if needed
    if (!convId && newUserId) {
      const conv = await adminApi<{ id: string }>(`/api/messages/conversations`, {
        method: 'POST',
        body: JSON.stringify({ user_id: newUserId }),
      });
      convId = conv.id;
      setSelectedConv(conv.id);
    }

    if (!convId) return alert('Select a conversation or user first');

    const payload = {
      conversation_id: convId,
      body: newMessage,
      admin_id: adminId || undefined, // ✅ ensure backend knows who sent it
    };

    const created = await adminApi<Message | { message: Message }>(`/api/messages/send`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const msg: Message = 'message' in created ? created.message : created;
    setMessages((prev) => [...prev, msg]);
    setNewMessage('');
  } catch (e) {
    console.error('❌ Send message failed:', e);
  }
}
 

  // ⬇️ Auto-scroll
  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  return (
    <div className="container py-4">
      <h2>🧭 Admin Messages Test</h2>

      <div className="row g-3 mt-3">

        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-header">Conversations</div>
            <div className="list-group list-group-flush" style={{ maxHeight: 400, overflowY: 'auto' }}>
              {conversations.map((c) => (
                <button
                  key={c.id}
                  className={`list-group-item list-group-item-action ${
                    selectedConv === c.id ? 'active' : ''
                  }`}
                  onClick={() => {
                    setSelectedConv(c.id);
                    loadMessages(c.id);
                  }}
                >
                  {c.peer_display_name || `Conversation ${c.id}`}
                </button>
              ))}
              {!conversations.length && (
                <div className="list-group-item text-muted small">No conversations yet.</div>
              )}
            </div>

          
            <div className="card-body border-top">
              <label className="form-label">Start chat with:</label>
              <div className="d-flex gap-2">
                <select
                  className="form-select"
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value)}
                >
                  <option value="">Select user…</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name || u.email || u.id}
                    </option>
                  ))}
                </select>
                <button className="btn btn-primary" onClick={startConversation}>
                  Start
                </button>
              </div>
            </div>
          </div>
        </div>

     
        <div className="col-md-8">
          <div className="card shadow-sm h-100">
            <div className="card-header">Thread</div>
            <div className="card-body" style={{ maxHeight: 400, overflowY: 'auto' }} ref={scrollerRef}>
              {loading ? (
                <p className="text-muted">Loading messages…</p>
              ) : messages.length ? (
                messages.map((m) => (
                  <motion.div
                    key={m.id}
                    className={`d-flex ${
                      m.sender_role === 'admin' ? 'justify-content-end' : 'justify-content-start'
                    } mb-2`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div
                      className={`p-2 rounded-3 ${
                        m.sender_role === 'admin' ? 'bg-primary text-white' : 'bg-light'
                      }`}
                      style={{ maxWidth: '70%' }}
                    >
                      {m.body}
                      <div className="small text-muted mt-1">
                        {new Date(m.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-muted small">No messages yet.</p>
              )}
            </div>

            <div className="card-footer">
              <div className="input-group">
                <input
                  className="form-control"
                  placeholder="Type a message…"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button className="btn btn-success" onClick={sendMessage}>
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}





*/}
