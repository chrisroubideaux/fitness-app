// components/profile/messages/NewMessageTab.tsx
// components/profile/messages/NewMessageTab.tsx
'use client';

import { useState } from 'react';

type Props = {
  // Optional: if provided, we’ll notify the parent to open the new chat after send
  onStart?: (adminId: string, label?: string, subject?: string) => void;
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

// Replace these with your real admins / ids
const ADMIN_DIRECTORY: { value: string; label: string }[] = [
  // { value: 'e.g.-admin-uuid-1', label: 'Coach Lena' },
  // { value: 'e.g.-admin-uuid-2', label: 'Admin Team' },
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

    const adminId = recipient; // expecting an admin_id value from the <select>
    if (!adminId) {
      setError('Please select a recipient.');
      return;
    }

    try {
      setSending(true);
      // Send the first message; server will create/fetch conversation
      await api<{
        id: string;
        conversation_id: string;
        sender_role: 'admin' | 'user';
        body: string;
        created_at: string;
      }>(`/api/messages/send`, {
        method: 'POST',
        body: JSON.stringify({ admin_id: adminId, body: message }),
      });

      setSuccess(true);

      // Optionally tell parent to open the new chat
      const label = ADMIN_DIRECTORY.find((a) => a.value === adminId)?.label || 'Admin';
      onStart?.(adminId, label, subject);

      // Reset form after a moment
      setTimeout(() => {
        setRecipient('');
        setSubject('');
        setMessage('');
        setSuccess(false);
      }, 1500);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('Failed to send message');
      }
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
            {ADMIN_DIRECTORY.length === 0 && (
              <option value="" disabled>
                (Add admin IDs in ADMIN_DIRECTORY)
              </option>
            )}
            {ADMIN_DIRECTORY.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
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