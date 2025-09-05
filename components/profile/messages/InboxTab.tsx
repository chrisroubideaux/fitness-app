// components/profile/messages/InboxTab.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { UIMessage } from './types';

type ApiConversation = {
  id: string;
  user_id: string;
  admin_id: string;
  peer_display_name?: string;
  unread_count?: number;
  last_message_at: string | null;
  created_at: string | null;
};

type MessageThread = {
  id: string;                 // conversation id
  admin_id: string;
  sender: string;             // label in list
  subject: string;
  preview?: string;
  timestamp?: string;         // keep raw ISO for sorting
  unread_count?: number;
  messages: UIMessage[];
};

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

// user-side API helper (authToken) with no-cache + ts param
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

type Props = { onMessageClick: (thread: MessageThread) => void };

export default function InboxTab({ onMessageClick }: Props) {
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  async function loadInbox() {
    setError(null);
    setLoading(true);
    try {
      const convos = await api<ApiConversation[]>(`/api/messages/conversations?limit=50`);

      const mapped: MessageThread[] = convos.map((c) => ({
        id: c.id,
        admin_id: c.admin_id,
        sender: c.peer_display_name || 'Coach/Admin',
        subject: 'Conversation',
        preview: '',
        timestamp: c.last_message_at || undefined,  // raw ISO
        unread_count: c.unread_count ?? 0,
        messages: [],
      }));

      setThreads(mapped);
    } catch (e) {
      console.error('❌ Failed to load user conversations', e);
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInbox();
    // light polling so admin-sent messages appear without a hard reload
    timerRef.current = setInterval(loadInbox, 10000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sorted = useMemo(() => {
    return [...threads].sort((a, b) => {
      const ta = a.timestamp ? Date.parse(a.timestamp) : 0;
      const tb = b.timestamp ? Date.parse(b.timestamp) : 0;
      return tb - ta;
    });
  }, [threads]);

  const UnreadBadge = ({ count }: { count?: number }) =>
    !count ? null : (
      <span className="badge bg-danger ms-2" style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px' }}>
        {count}
      </span>
    );

  return (
    <div className="inbox-wrapper bg-transparent">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0">Inbox</h6>
        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-outline-secondary" onClick={loadInbox} disabled={loading} title="Refresh">
            ⟳ Refresh
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger p-2 mb-2">{error}</div>}
      {loading && <div className="text-muted small mb-2">Loading conversations…</div>}

      <ul className="list-group">
        {sorted.map((thread) => (
          <li
            key={thread.id}
            className="list-group-item list-group-item-action bg-transparent"
            onClick={() => onMessageClick(thread)}
            style={{ cursor: 'pointer' }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <strong>{thread.sender}</strong> — {thread.subject}
                <UnreadBadge count={thread.unread_count} />
                {thread.preview && <div className="text-muted small">{thread.preview}</div>}
              </div>
              <small className="text-muted">
                {thread.timestamp ? new Date(thread.timestamp).toLocaleString() : '—'}
              </small>
            </div>
          </li>
        ))}

        {!loading && !error && sorted.length === 0 && (
          <li className="list-group-item bg-transparent text-muted small">No conversations yet.</li>
        )}
      </ul>
    </div>
  );
}



/*

// components/profile/messages/InboxTab.tsx
'use client';

import { useEffect, useState } from 'react';
import { UIMessage } from './types';

type MessageThread = {
  id: string;
  admin_id: string;
  sender: string;
  subject: string;
  preview: string;
  timestamp: string;
  messages: UIMessage[];
};

type ApiConversation = {
  id: string;
  user_id: string;
  admin_id: string;
  unread_count: number;
  last_message_at: string | null;
  created_at: string | null;
};

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

type InboxProps = {
  onMessageClick: (thread: MessageThread) => void;
};

export default function InboxTab({ onMessageClick }: InboxProps) {
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let abort = false;

    async function load() {
      setLoading(true);
      try {
        // Fetch conversations for this user
        const convos = await api<ApiConversation[]>(`/api/messages/conversations?limit=20`);
        if (abort) return;

        const mapped: MessageThread[] = convos.map((c) => ({
          id: c.id,
          admin_id: c.admin_id,
          sender: 'Coach/Admin', // TODO: resolve actual admin name later
          subject: 'Conversation',
          preview: '', // TODO: fetch last message if needed
          timestamp: c.last_message_at
            ? new Date(c.last_message_at).toLocaleString()
            : '—',
          messages: [] as UIMessage[],
        }));
        setThreads(mapped);
      } catch (err) {
        console.error('❌ Failed to load user conversations', err);
      } finally {
        if (!abort) setLoading(false);
      }
    }

    load();
    return () => { abort = true; };
  }, []);

  return (
    <div className="inbox-wrapper bg-transparent">
      <h6 className="mb-3">Inbox</h6>
      {loading && <div className="text-muted small">Loading conversations…</div>}
      <ul className="list-group">
        {threads.map((thread) => (
          <li
            key={thread.id}
            className="list-group-item list-group-item-action bg-transparent"
            onClick={() => onMessageClick(thread)}
            style={{ cursor: 'pointer' }}
          >
            <div className="d-flex justify-content-between">
              <div>
                <strong>{thread.sender}</strong> — {thread.subject}
                {thread.preview && (
                  <p className="mb-0 text-muted" style={{ fontSize: '0.85rem' }}>
                    {thread.preview}
                  </p>
                )}
              </div>
              <small className="text-muted">{thread.timestamp}</small>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}




*/
