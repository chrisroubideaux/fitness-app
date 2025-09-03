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


/*

// components/profile/messages/InboxTab.tsx

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
