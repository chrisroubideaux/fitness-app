'use client';

import { useState } from 'react';

type Props = {
  // Optional: notify parent to open the new chat after send
  onStart?: (userId: string, label?: string, subject?: string) => void;
};

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

// inline API helper
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

// Replace with real user IDs once available
const USER_DIRECTORY: { value: string; label: string }[] = [
  // { value: 'user-uuid-1', label: 'Test User' },
  // { value: 'user-uuid-2', label: 'Another User' },
];

export default function NewMessageTab({ onStart }: Props) {
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const userId = recipient;
    if (!userId) {
      setError('Please select a recipient.');
      return;
    }

    try {
      setSending(true);

      await api<{
        id: string;
        conversation_id: string;
        sender_role: 'admin' | 'user';
        body: string;
        created_at: string;
      }>(`/api/messages/send`, {
        method: 'POST',
        body: JSON.stringify({ user_id: userId, body: message }),
      });

      setSuccess(true);

      // notify parent panel
      const label = USER_DIRECTORY.find((u) => u.value === userId)?.label || 'User';
      onStart?.(userId, label, subject);

      // reset
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
            {USER_DIRECTORY.length === 0 && (
              <option value="" disabled>
                (Add user IDs in USER_DIRECTORY)
              </option>
            )}
            {USER_DIRECTORY.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
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



/*
'use client';

import { useState } from 'react';

export default function NewMessageTab() {
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 🚧 You’ll add backend submission logic here later
    setSuccess(true);

    // Clear form after 2 seconds
    setTimeout(() => {
      setRecipient('');
      setSubject('');
      setMessage('');
      setSuccess(false);
    }, 2000);
  };

  return (
    <div className="new-message-wrapper">
      <h6 className="mb-3">Compose New Message</h6>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Recipient</label>
          <select
            className="form-select form-select-sm"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            required
          >
            <option value="">Select...</option>
            <option value="admin">Admin Team</option>
            <option value="coach">Coach Lena</option>
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
            placeholder="Type your message here..."
            required
          />
        </div>

        <button type="submit" className="btn btn-sm btn-success">
          Send Message
        </button>

        {success && (
          <div className="alert alert-success mt-3 p-2" role="alert">
            ✅ Message sent successfully!
          </div>
        )}
      </form>
    </div>
  );
}

*/