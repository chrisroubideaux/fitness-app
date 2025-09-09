// components/admin/users/UsersPanel.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

type User = {
  id: string;
  full_name: string;
  email: string;
  bio?: string;
  address?: string;
  phone_number?: string;
  profile_image_url?: string;
  plan_name?: string;
  plan_price?: number;
  plan_features?: string[];
};

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

async function fetchUsers(): Promise<User[]> {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${BASE}/api/admins/users?limit=5`, {
    headers,
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }

  return res.json();
}

export default function AdminUsersPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchUsers();
        setUsers(data);
      } catch (e: unknown) {
        console.error('❌ Failed to load users', e);
        setError(e instanceof Error ? e.message : 'Failed to load users');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="p-3">
      <h5 className="mb-3 fw-bold">👥 Users</h5>

      {loading && <p className="text-muted">Loading users…</p>}
      {error && <div className="alert alert-danger">{error}</div>}

      {users.map((u, idx) => (
        <motion.div
          key={u.id}
          className="card mb-3 shadow-sm border-0 rounded-3 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          style={{ maxWidth: 600 }}
        >
          <div className="row g-0">
            <div className="col-4 d-flex align-items-center justify-content-center bg-light">
              <Image
                src="/"
                alt={u.full_name}
                width={120}
                height={120}
                className="rounded-circle object-fit-cover"
              />
            </div>
            <div className="col-8">
              <div className="card-body">
                <h6 className="card-title mb-1">{u.full_name}</h6>
                <p className="card-text text-muted small mb-1">{u.email}</p>

                {u.bio && <p className="card-text small">{u.bio.slice(0, 80)}...</p>}

                <p className="card-text">
                  <small className="text-body-secondary">
                    Plan: {u.plan_name || 'Free'}{' '}
                    {u.plan_price ? `($${u.plan_price}/mo)` : ''}
                  </small>
                </p>

                <div className="d-flex gap-2 mt-2">
                  <button className="btn btn-sm btn-primary">📩 Message</button>
                  <button className="btn btn-sm btn-outline-secondary">View Profile</button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}

      {!loading && users.length === 0 && (
        <p className="text-muted">No users found.</p>
      )}
    </div>
  );
}

