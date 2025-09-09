// components/profile/messages/InboxTab.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import type { UIMessage } from './types';

type ApiConversation = {
  id: string;
  user_id: string;
  admin_id: string;
  peer_display_name: string;
  last_message_at: string | null;
  last_message_body?: string | null;   // ✅ add support if backend sends snippet
  unread_count?: number;
  created_at: string | null;
};

type MessageThread = {
  id: string;
  user_id: string;
  admin_id: string;
  sender: string;
  subject: string;
  preview?: string;
  timestamp?: string;
  unread_count?: number;
  messages: UIMessage[];
};

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

// ---- User token helpers ----
function getUserToken(): string {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem('authToken')?.trim() || '';
}

function decodeJwtExp(token: string): Date | null {
  try {
    const [, payload] = token.split('.');
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return typeof json?.exp === 'number' ? new Date(json.exp * 1000) : null;
  } catch {
    return null;
  }
}

// ---- API helper for users ----
async function userApi<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getUserToken();

  console.debug('[InboxTab userApi]', {
    hasToken: Boolean(token),
    exp: token ? decodeJwtExp(token)?.toLocaleString() : null,
    path,
  });

  if (!token) {
    throw new Error('⚠️ No user token found in localStorage. Please log in again.');
  }

  const headers = new Headers(init.headers ?? {});
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${BASE}${path}`, { ...init, headers, cache: 'no-store' });
  const raw = await res.text().catch(() => '');

  if (res.status === 401) {
    try {
      const body = raw ? JSON.parse(raw) : {};
      const msg: string = body?.message || body?.error || 'Unauthorized';
      if ((msg || '').toLowerCase().includes('expired')) {
        localStorage.removeItem('authToken');
      }
      throw new Error(`401 Unauthorized: ${msg}`);
    } catch {
      localStorage.removeItem('authToken');
      throw new Error(`401 Unauthorized: ${raw || 'Request failed'}`);
    }
  }

  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${raw || 'Request failed'}`);
  return raw ? (JSON.parse(raw) as T) : ({} as T);
}

// ---- Component ----
type InboxProps = { onMessageClick: (thread: MessageThread) => void };

export default function InboxTab({ onMessageClick }: InboxProps) {
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let abort = false;

    const token = getUserToken();
    if (!token) {
      setError('⚠️ No user token found. Please log in again.');
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const convos = await userApi<ApiConversation[]>(
          `/api/messages/conversations?limit=50&ts=${Date.now()}`
        );
        if (abort) return;

        const mapped: MessageThread[] = convos.map((c) => ({
          id: c.id,
          user_id: c.user_id,
          admin_id: c.admin_id,
          sender: c.peer_display_name,
          subject: 'Conversation',
          messages: [] as UIMessage[],
          timestamp: c.last_message_at || c.created_at || undefined,
          // ✅ If backend sends last_message_body use it, else show placeholder
          preview: c.last_message_body || 'Tap to view messages',
          unread_count: c.unread_count ?? 0,
        }));

        setThreads(mapped);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error('❌ Failed to load conversations:', msg);
        setError(msg);
      } finally {
        if (!abort) setLoading(false);
      }
    })();

    return () => {
      abort = true;
    };
  }, []);

  const UnreadBadge = ({ count }: { count: number | undefined }) =>
    !count ? null : (
      <span
        className="badge bg-danger ms-2"
        style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px' }}
      >
        {count}
      </span>
    );

  const sorted = useMemo(
    () =>
      [...threads].sort((a, b) => {
        const ta = a.timestamp ? Date.parse(a.timestamp) : 0;
        const tb = b.timestamp ? Date.parse(b.timestamp) : 0;
        return tb - ta;
      }),
    [threads]
  );

  return (
    <div className="inbox-wrapper bg-transparent">
      <h6 className="mb-3">Inbox</h6>

      {loading && <div className="text-muted small">Loading conversations…</div>}
      {error && (
        <div className="alert alert-warning py-2 px-3 mb-2" role="alert">
          {error}
        </div>
      )}

      <ul className="list-group">
        {sorted.map((thread) => (
          <li
            key={thread.id}
            className="list-group-item list-group-item-action bg-transparent"
            onClick={() => {
              onMessageClick(thread);
              setThreads((prev) =>
                prev.map((t) => (t.id === thread.id ? { ...t, unread_count: 0 } : t))
              );
            }}
            style={{ cursor: 'pointer' }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <strong>{thread.sender}</strong> — {thread.subject}
                <UnreadBadge count={thread.unread_count} />
                {thread.preview && (
                  <div className="text-muted small">{thread.preview}</div>
                )}
              </div>
              <small className="text-muted">
                {thread.timestamp ? new Date(thread.timestamp).toLocaleString() : '—'}
              </small>
            </div>
          </li>
        ))}
      </ul>

      {!loading && !error && !threads.length && (
        <div className="text-muted small mt-2">No conversations</div>
      )}
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
