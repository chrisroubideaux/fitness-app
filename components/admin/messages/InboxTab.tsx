// components/admin/messages/InboxTab.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { MessageThread, UIMessage } from './types';

type ApiConversation = {
  id: string;
  user_id: string;
  admin_id: string;
  peer_display_name: string;   
  last_message_at: string | null; 
  unread_count?: number;     
  created_at: string | null;
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
        const convos = await api<ApiConversation[]>(`/api/messages/conversations?limit=50`);
        if (abort) return;

        const mapped: MessageThread[] = convos.map((c) => ({
          id: c.id,
          user_id: c.user_id,
          sender: c.peer_display_name,         // 👈 use backend-provided name
          subject: 'Conversation',
          messages: [] as UIMessage[],
          timestamp: c.last_message_at || undefined, // keep ISO for sorting
          preview: '',
          unread_count: c.unread_count ?? 0,
        }));

        setThreads(mapped);
      } catch (err) {
        console.error('❌ Failed to load admin conversations', err);
      } finally {
        if (!abort) setLoading(false);
      }
    }

    load();
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

      <ul className="list-group">
        {sorted.map((thread) => (
          <li
            key={thread.id}
            className="list-group-item list-group-item-action bg-transparent"
            onClick={() => {
              onMessageClick(thread);
              // Optimistically clear badge when opened
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
