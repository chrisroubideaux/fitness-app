// components/admin/messages/NewMessageTab.tsx
'use client';

import { useEffect, useState } from 'react';

type Props = {
  onStart?: (userId: string, label?: string, subject?: string) => void;
};

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

// ✅ admin API helper
async function adminApi<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('adminToken') || localStorage.getItem('token')
      : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init.headers || {}),
  };

  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  const raw = await res.text().catch(() => '');
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}: ${raw || 'Request failed'}`);
  }
  return raw ? (JSON.parse(raw) as T) : ({} as T);
}

type ApiUser = {
  id: string;
  full_name?: string | null;
  email: string;
};

export default function NewMessageTab({ onStart }: Props) {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // 🔹 Load up to 4 users from backend (admin-only route)
  useEffect(() => {
    (async () => {
      try {
        const data = await adminApi<ApiUser[]>(`/api/admins/users?limit=4`);
        setUsers(data);
      } catch (e: unknown) {
        console.error('❌ Failed to fetch users for dropdown', e);
        setError('Could not load users');
      }
    })();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!recipient) {
      setError('Please select a recipient.');
      return;
    }

    try {
      setSending(true);

      await adminApi<{
        id: string;
        conversation_id: string;
        sender_role: 'admin' | 'user';
        body: string;
        created_at: string;
      }>(`/api/messages/send`, {
        method: 'POST',
        body: JSON.stringify({ user_id: recipient, body: message }),
      });

      setSuccess(true);

      const label =
        users.find((u) => u.id === recipient)?.full_name ||
        users.find((u) => u.id === recipient)?.email ||
        'User';

      onStart?.(recipient, label, subject);

      setTimeout(() => {
        setRecipient('');
        setSubject('');
        setMessage('');
        setSuccess(false);
      }, 1500);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="new-message-wrapper">
      <h6 className="mb-3">Compose New Message</h6>

      {error && <div className="alert alert-danger p-2">{error}</div>}
      {success && (
        <div className="alert alert-success p-2" role="alert">
          ✅ Message sent successfully!
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Recipient</label>
          <select
            className="form-select form-select-sm"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            required
          >
            <option value="">Select…</option>
            {users.length === 0 && <option disabled>(No users found)</option>}
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.full_name || u.email}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Subject</label>
          <input
            type="text"
            className="form-control form-control-sm"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter a subject"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Message</label>
          <textarea
            className="form-control form-control-sm"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here…"
            required
          />
        </div>

        <button type="submit" className="btn btn-sm btn-success" disabled={sending}>
          {sending ? 'Sending…' : 'Send Message'}
        </button>
      </form>
    </div>
  );
}

