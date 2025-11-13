// app/messages-test/page.tsx
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

type Admin = { id: string; full_name?: string | null; email?: string | null; profile_image_url?: string | null };

export default function MessagesTestPage() {
  const dispatch = useAppDispatch();

  const { conversations, activeConversationId, messagesByConv, loadingConvos, loadingMessages, sending, error } =
    useAppSelector((s) => s.messages);
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  const [admins, setAdmins] = useState<Admin[]>([]);
  const [newAdminId, setNewAdminId] = useState<string>('');
  const [draft, setDraft] = useState('');
  const scrollerRef = useRef<HTMLDivElement>(null);

  const activeMsgs = useMemo(
    () => (activeConversationId ? (messagesByConv[activeConversationId] ?? []) : []),
    [messagesByConv, activeConversationId]
  );

  // load admins for "start chat"
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const base = (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000').replace(/\/+$/, '');
        const res = await fetch(`${base}/api/users/admins`, { headers: { Authorization: `Bearer ${token}` } });
        const data: Admin[] = await res.json();
        setAdmins(data);
      } catch {
        // ignore in test UI
      }
    })();
  }, [token]);

  // load conversations on mount
  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  // when selecting a conversation, load messages + mark read
  useEffect(() => {
    if (!activeConversationId) return;
    dispatch(fetchMessages({ conversation_id: activeConversationId, limit: 30 })).then(() => {
      dispatch(markConversationRead({ conversation_id: activeConversationId }));
    });
  }, [dispatch, activeConversationId]);

  // autoscroll to bottom when messages change
  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: 'smooth' });
  }, [activeMsgs.length]);

  const handleStartChat = async () => {
    if (!newAdminId) return;
    const action = await dispatch(openOrCreateConversation({ admin_id: newAdminId }));
    if (openOrCreateConversation.fulfilled.match(action) && action.payload.id) {
      const id = action.payload.id as UUID;
      dispatch(setActiveConversation(id));
    }
  };

  const handleSend = async () => {
    if (!draft.trim()) return;
    await dispatch(sendMessageThunk({ body: draft.trim(), conversation_id: activeConversationId ?? undefined, admin_id: !activeConversationId ? newAdminId || undefined : undefined }));
    setDraft('');
  };

  return (
    <div className="container py-4">
      <h2 className="mb-3">💬 Messages Redux Test</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-3">
        {/* Conversations */}
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-header d-flex align-items-center justify-content-between">
              <strong>Conversations</strong>
              {loadingConvos && <span className="small text-muted">Loading…</span>}
            </div>
            <div className="list-group list-group-flush" style={{ maxHeight: 420, overflowY: 'auto' }}>
              {conversations.map((c) => (
                <button
                  key={c.id}
                  className={`list-group-item list-group-item-action d-flex justify-content-between ${activeConversationId === c.id ? 'active' : ''}`}
                  onClick={() => dispatch(setActiveConversation(c.id))}
                >
                  <span>{c.peer_display_name}</span>
                  {c.unread_count > 0 && <span className="badge bg-info">{c.unread_count}</span>}
                </button>
              ))}
              {!loadingConvos && conversations.length === 0 && (
                <div className="list-group-item text-muted">No conversations yet.</div>
              )}
            </div>

            {/* Start new convo (user -> admin) */}
            <div className="card-body border-top">
              <label className="form-label">Start a new chat with:</label>
              <div className="d-flex gap-2">
                <select className="form-select" value={newAdminId} onChange={(e) => setNewAdminId(e.target.value)}>
                  <option value="">Select admin…</option>
                  {admins.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.full_name || a.email || a.id}
                    </option>
                  ))}
                </select>
                <button className="btn btn-primary" onClick={handleStartChat} disabled={!newAdminId}>
                  Start
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Thread */}
        <div className="col-md-8">
          <div className="card shadow-sm h-100">
            <div className="card-header d-flex align-items-center justify-content-between">
              <strong>Thread</strong>
              {loadingMessages && <span className="small text-muted">Loading…</span>}
            </div>

            <div ref={scrollerRef} className="card-body" style={{ height: 420, overflowY: 'auto' }}>
              {activeConversationId ? (
                activeMsgs.length > 0 ? (
                  activeMsgs.map((m) => (
                    <div
                      key={m.id}
                      className={`d-flex ${m.sender_role === 'user' ? 'justify-content-end' : 'justify-content-start'} mb-2`}
                    >
                      <div
                        className={`p-2 rounded-3 ${m.sender_role === 'user' ? 'bg-primary text-white' : 'bg-light'}`}
                        style={{ maxWidth: '70%' }}
                      >
                        <div className="small">{m.body}</div>
                        <div className="small text-muted mt-1">{new Date(m.created_at).toLocaleString()}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-muted">No messages yet. Say hi! 👋</div>
                )
              ) : (
                <div className="text-muted">Pick a conversation or start a new chat.</div>
              )}
            </div>

            {/* Composer */}
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
                <button className="btn btn-primary" onClick={handleSend} disabled={sending || !draft.trim()}>
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
