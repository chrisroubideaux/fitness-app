// components/profile/messages/NewMessageTab.tsx
'use client';

import { useEffect, useState } from 'react';

type Props = {
  onStart?: (adminId: string, label?: string, subject?: string) => void;
};

type AdminOption = {
  id: string;
  full_name?: string;
  email?: string;
  profile_image_url?: string;
};

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
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

export default function NewMessageTab({ onStart }: Props) {
  const [admins, setAdmins] = useState<AdminOption[]>([]);
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // Load admin list on mount
  useEffect(() => {
    (async () => {
      try {
        // ✅ FIX: point to /api/users/admins instead of /api/admins
        const data = await api<AdminOption[]>('/api/users/admins');
        setAdmins(data);
      } catch (e) {
        console.error('❌ Failed to load admins', e);
        setError('Could not load admin directory');
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
      await api(`/api/messages/send`, {
        method: 'POST',
        body: JSON.stringify({ admin_id: recipient, body: message }),
      });

      setSuccess(true);

      const label =
        admins.find((a) => a.id === recipient)?.full_name ||
        admins.find((a) => a.id === recipient)?.email ||
        'Admin';

      onStart?.(recipient, label, subject);

      setTimeout(() => {
        setRecipient('');
        setSubject('');
        setMessage('');
        setSuccess(false);
      }, 1500);
    } catch (e: unknown) {
      if (e instanceof Error) setError(e.message);
      else setError('Failed to send message');
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
            {admins.map((a) => (
              <option key={a.id} value={a.id}>
                {a.full_name || a.email || a.id}
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