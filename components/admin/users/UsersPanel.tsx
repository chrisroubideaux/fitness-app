// components/admin/users/UsersPanel.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  FaEnvelope,
  FaUser,
  FaTimes,
  FaPhone,
  FaMapMarkerAlt,
  FaCrown,
  FaCheckCircle,
  FaCalendarAlt,
  FaComments,
  FaPrayingHands,
  FaRegFileAlt,
  FaRedo,
  FaAppleAlt,
  FaVideo,
  FaStopwatch,
  FaLink,
  FaTrophy,
  FaUsers,
  FaChartLine,
  FaBell,
  FaSyncAlt,
} from 'react-icons/fa';

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

type AdminUsersPanelProps = {
  onMessageUser: (user: User) => void;
};

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

// Map feature text → icon
function getFeatureIcon(feature: string) {
  if (feature.startsWith('✅')) return <FaCheckCircle className="bio-icon" />;
  if (feature.startsWith('📅')) return <FaCalendarAlt className="bio-icon" />;
  if (feature.startsWith('💬')) return <FaComments className="bio-icon" />;
  if (feature.startsWith('🧘')) return <FaPrayingHands className="bio-icon" />;
  if (feature.startsWith('📝')) return <FaRegFileAlt className="bio-icon" />;
  if (feature.startsWith('🔁')) return <FaRedo className="bio-icon" />;
  if (feature.startsWith('🍎')) return <FaAppleAlt className="bio-icon" />;
  if (feature.startsWith('🎥')) return <FaVideo className="bio-icon" />;
  if (feature.startsWith('⏱️')) return <FaStopwatch className="bio-icon" />;
  if (feature.startsWith('🔗')) return <FaLink className="bio-icon" />;
  if (feature.startsWith('🏆')) return <FaTrophy className="bio-icon" />;
  if (feature.startsWith('👥')) return <FaUsers className="bio-icon" />;
  if (feature.startsWith('📈')) return <FaChartLine className="bio-icon" />;
  if (feature.startsWith('🛎️')) return <FaBell className="bio-icon" />;
  if (feature.startsWith('🔄')) return <FaSyncAlt className="bio-icon" />;
  return <FaCheckCircle className="bio-icon" />;
}

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

export default function AdminUsersPanel({ onMessageUser }: AdminUsersPanelProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);

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
      <h5 className="mb-3 fw-bold d-flex align-items-center gap-2">
        <FaUser className='bio-icon' /> Users
      </h5>

      {loading && <p className="text-muted">Loading users…</p>}
      {error && <div className="alert alert-danger">{error}</div>}

      {users.map((u, idx) => (
        <motion.div
          key={u.id}
          className="card mb-3 shadow-md border-0 rounded-3 overflow-hidden"
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
                <h5 className=" mb-1 fw-semibold">{u.full_name}</h5>
                <p className=" small mb-1">{u.email}</p>

                {u.bio && (
                  <p className="card-text small text-truncate">{u.bio}</p>
                )}

                <p className="card-text mb-1 d-flex align-items-center gap-2">
                  <FaCrown className="bio-icon" />
                  <small className="text-body-secondary">
                    {u.plan_name || 'Free'}{' '}
                    {u.plan_price ? `($${u.plan_price}/mo)` : ''}
                  </small>
                </p>

                <div className="d-flex gap-2 mt-2">
                  <button
                    className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1 px-2 py-1"
                    onClick={() => onMessageUser(u)}
                  >
                    <FaEnvelope /> Message
                  </button>
                  <button
                    className="btn btn-outline-secondary btn-sm px-2 py-1"
                    onClick={() => setSelectedUser(u)}
                  >
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}

      {!loading && users.length === 0 && (
        <p className="text-muted">No users found.</p>
      )}

      {/* Profile Modal */}
      {selectedUser && (
        <div
          className="modal fade show"
          style={{
            display: 'block',
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(3px)',
          }}
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            style={{ maxWidth: 500 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content rounded-3 shadow">
              <div className="modal-header border-0">
                <h5 className="modal-title">{selectedUser.full_name}</h5>
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => setSelectedUser(null)}
                >
                  <FaTimes />
                </button>
              </div>
              <div className="modal-body">
                <div className="d-flex align-items-center mb-3">
                  <Image
                    src="/"
                    alt={selectedUser.full_name}
                    width={80}
                    height={80}
                    className="rounded-circle me-3"
                  />
                  <div>
                    <p className="mb-1 small text-muted d-flex align-items-center gap-2">
                      <FaEnvelope className='bio-icon' /> {selectedUser.email}
                    </p>
                    <p className="mb-1 small text-muted d-flex align-items-center gap-2">
                      <FaPhone className='bio-icon' /> {selectedUser.phone_number || 'N/A'}
                    </p>
                    <p className="mb-1 small text-muted d-flex align-items-center gap-2">
                      <FaMapMarkerAlt className='bio-icon' /> {selectedUser.address || 'N/A'}
                    </p>
                  </div>
                </div>

                <p className="mb-2 d-flex align-items-center gap-2">
                  <FaCrown className="text-warning" />{' '}
                  {selectedUser.plan_name || 'Free'}{' '}
                  {selectedUser.plan_price
                    ? `($${selectedUser.plan_price}/mo)`
                    : ''}
                </p>

                {selectedUser.plan_features && (
                  <>
                    <h5 className="fw-semibold mt-3">Plan Features</h5>
                    <ul className="small list-unstyled nav-link">
                      {selectedUser.plan_features.map((f, i) => (
                        <li
                          key={i}
                          className="d-flex align-items-center gap-2 mb-1"
                        >
                          {getFeatureIcon(f)}
                          <span>{f.replace(/^([\p{Emoji}\u200d\s]+)/u, '')}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {selectedUser.bio && (
                  <p className="mt-3 small d-flex align-items-center gap-2">
                    <FaUser /> {selectedUser.bio}
                  </p>
                )}
              </div>
              <div className="modal-footer border-0 d-flex justify-content-between">
                <button
                  className="btn btn-light btn-sm"
                  onClick={() => setSelectedUser(null)}
                >
                  Close
                </button>
                <button
                  className="btn btn-primary btn-sm d-flex align-items-center gap-1"
                  onClick={() => onMessageUser(selectedUser)}
                >
                  <FaEnvelope /> Message User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




/*
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

type AdminUsersPanelProps = {
  onMessageUser: (user: User) => void;
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

export default function AdminUsersPanel({ onMessageUser }: AdminUsersPanelProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);

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
                src={u.profile_image_url || '/default-avatar.png'}
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
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => onMessageUser(u)}
                  >
                    📩 Message
                  </button>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setSelectedUser(u)}
                  >
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}

      {!loading && users.length === 0 && (
        <p className="text-muted">No users found.</p>
      )}

    
      {selectedUser && (
        <div
          className="modal fade show"
          style={{ display: 'block', background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedUser.full_name}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedUser(null)}
                />
              </div>
              <div className="modal-body">
                <div className="d-flex align-items-center mb-3">
                  <Image
                    src={selectedUser.profile_image_url || '/default-avatar.png'}
                    alt={selectedUser.full_name}
                    width={100}
                    height={100}
                    className="rounded-circle me-3"
                  />
                  <div>
                    <p className="mb-1"><strong>Email:</strong> {selectedUser.email}</p>
                    <p className="mb-1"><strong>Phone:</strong> {selectedUser.phone_number || 'N/A'}</p>
                    <p className="mb-1"><strong>Address:</strong> {selectedUser.address || 'N/A'}</p>
                  </div>
                </div>

                <p><strong>Plan:</strong> {selectedUser.plan_name || 'Free'} {selectedUser.plan_price ? `($${selectedUser.plan_price}/mo)` : ''}</p>

                {selectedUser.plan_features && (
                  <>
                    <h6>Plan Features:</h6>
                    <ul>
                      {selectedUser.plan_features.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </>
                )}

                {selectedUser.bio && (
                  <p className="mt-3"><strong>Bio:</strong> {selectedUser.bio}</p>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setSelectedUser(null)}>
                  Close
                </button>
                <button className="btn btn-primary" onClick={() => onMessageUser(selectedUser)}>
                  📩 Message User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




*/
