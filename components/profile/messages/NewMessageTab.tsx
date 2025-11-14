// components/profile/messages/NewMessageTab.tsx
'use client';

import { useEffect, useState, JSX } from 'react';
import Select from 'react-select';

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
  const [recipient, setRecipient] = useState<AdminOption | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // Load admin list on mount
  useEffect(() => {
    (async () => {
      try {
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
        body: JSON.stringify({ admin_id: recipient.id, body: message }),
      });

      setSuccess(true);

      const label = recipient.full_name || recipient.email || 'Admin';
      onStart?.(recipient.id, label, subject);

      setTimeout(() => {
        setRecipient(null);
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

  // 🔹 Format options with avatar + name/email
  const formattedOptions = admins.map((a) => ({
    value: a.id,
    label: (
      <div className="d-flex align-items-center gap-2">
        <img
          src={a.profile_image_url || '/default-avatar.png'}
          alt={a.full_name || a.email || 'Admin'}
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            objectFit: 'cover',
          }}
        />
        <span>{a.full_name || a.email || a.id}</span>
      </div>
    ),
    data: a,
  }));

  return (
    <div className="new-message-wrapper">
      <h6 className="mb-3">Compose New Message</h6>

      {error && <div className="alert alert-danger p-2">{error}</div>}
      {success && (
        <div className="alert alert-success p-2" role="alert">
          ✅ Message sent successfully!
        </div>
      )}

      <form className='' onSubmit={handleSubmit} >
        {/* Recipient Dropdown */}
        <div className="mb-3">
          <label className="form-label">Recipient</label>
          <Select
            options={formattedOptions}
            value={
              recipient
                ? {
                    value: recipient.id,
                    label: (
                      <div className="d-flex align-items-center gap-2">
                        <img
                          src={recipient.profile_image_url || '/default-avatar.png'}
                          alt={recipient.full_name || recipient.email || 'Admin'}
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            objectFit: 'cover',
                          }}
                        />
                        <span>{recipient.full_name || recipient.email}</span>
                      </div>
                    ),
                    data: recipient,
                  }
                : null
            }
            onChange={(selected: { value: string; label: JSX.Element; data: AdminOption } | null) =>
              setRecipient(selected?.data || null)
            }
            classNamePrefix="custom-select"
            styles={{
              control: (base) => ({
                ...base,
                background: 'linear-gradient(234deg, #fdfcff, #e6e9f5, #ffffff)',
                borderRadius: '0.5rem',
                padding: '2px',
              }),
              singleValue: (base) => ({
                ...base,
                color: '#444',
              }),
              menu: (base) => ({
                ...base,
                background: 'linear-gradient(234deg, #fdfcff, #e6e9f5, #ffffff)',
              }),
            }}
            placeholder="Select…"
          />
        </div>

        {/* Subject */}
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

        {/* Message */}
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
