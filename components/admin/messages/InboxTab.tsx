// components/admin/messages/InboxTab.tsx
// components/admin/messages/InboxTab.tsx
'use client';

import { useEffect, useState } from 'react';
import { MessageThread, UIMessage } from './types';

type ApiConversation = {
  id: string;
  user_id: string;
  admin_id: string;
  unread_count: number;
  last_message_at: string | null;
  created_at: string | null;
};

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

/** Get a valid admin token, storing it from ?token=... if present (first load) */
function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;

  // If a token is in the URL (after OAuth), persist it as adminToken
  const params = new URLSearchParams(window.location.search);
  const tokenFromURL = params.get('token');
  if (tokenFromURL) {
    localStorage.setItem('adminToken', tokenFromURL);
    // (Optional) clean it from the URL without reload
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, '', cleanUrl);
  }

  return localStorage.getItem('adminToken');
}

// ✅ Always use adminToken
async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAdminToken();
  // Debug line to verify we actually have a token
  console.log('[Admin InboxTab] sending adminToken?', Boolean(token), 'first20=', token?.slice(0, 20));

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
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let abort = false;

    async function load() {
      setLoading(true);
      setErr(null);

      const token = getAdminToken();
      if (!token) {
        setLoading(false);
        setErr('No admin token found. Please log in as admin.');
        return;
      }

      try {
        const convos = await api<ApiConversation[]>(`/api/messages/conversations?limit=20`);
        if (abort) return;

        const mapped: MessageThread[] = convos.map((c) => ({
          id: c.id,
          user_id: c.user_id,
          sender: 'User', // you can replace with a display name if you fetch it elsewhere
          subject: 'Conversation',
          messages: [] as UIMessage[], // ChatWindow will fetch the actual messages
          timestamp: c.last_message_at ? new Date(c.last_message_at).toLocaleString() : '—',
          preview: '',
        }));

        setThreads(mapped);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Failed to load conversations';
        console.error('❌ Failed to load admin conversations', e);
        setErr(msg);
      } finally {
        if (!abort) setLoading(false);
      }
    }

    load();
    return () => {
      abort = true;
    };
  }, []);

  return (
    <div className="inbox-wrapper bg-transparent">
      <h6 className="mb-3">Inbox</h6>

      {loading && <div className="text-muted small">Loading conversations…</div>}
      {err && !loading && (
        <div className="alert alert-danger p-2" role="alert">
          {err}
        </div>
      )}

      {!loading && !err && (
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
                </div>
                <small className="text-muted">{thread.timestamp ?? '—'}</small>
              </div>
            </li>
          ))}
          {threads.length === 0 && (
            <li className="list-group-item bg-transparent text-muted small">
              No conversations yet.
            </li>
          )}
        </ul>
      )}
    </div>
  );
}


/*
'use client';

type Message = {
  id: number;
  sender: 'admin' | 'user';
  content: string;
  timestamp: string;
};

type MessageThread = {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  timestamp: string;
  messages: Message[];
};

type InboxProps = {
  onMessageClick: (thread: MessageThread) => void;
};

export default function InboxTab({ onMessageClick }: InboxProps) {
  const mockThreads: MessageThread[] = Array.from({ length: 5 }, (_, i) => ({
    id: `${i + 1}`,
    sender: i % 2 === 0 ? 'Coach Lena' : 'Admin Team',
    subject: `Message Subject ${i + 1}`,
    preview: `This is a short preview of the message content ${i + 1}.`,
    timestamp: new Date(Date.now() - i * 3600000).toLocaleString(),
    messages: [
      {
        id: 1,
        sender: 'admin',
        content: 'Initial message content',
        timestamp: '10:00 AM',
      },
      {
        id: 2,
        sender: 'user',
        content: 'User reply content',
        timestamp: '10:01 AM',
      },
    ],
  }));

  return (
    <div className="inbox-wrapper bg-transparent">
      <h6 className="mb-3">Inbox</h6>
      <ul className="list-group">
        {mockThreads.map((thread) => (
          <li
            key={thread.id}
            className="list-group-item list-group-item-action bg-transparent"
            onClick={() => onMessageClick(thread)}
            style={{ cursor: 'pointer' }}
          >
            <div className="d-flex justify-content-between">
              <div>
                <strong>{thread.sender}</strong> — {thread.subject}
                <p className="mb-0 text-muted" style={{ fontSize: '0.85rem' }}>{thread.preview}</p>
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
