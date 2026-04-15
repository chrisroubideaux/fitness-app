// components/admin/users/UsersPanel.tsx
// components/admin/users/UsersPanel.tsx

'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

function getFeatureIcon(feature: string) {
  if (feature.startsWith('✅')) return <FaCheckCircle />;
  if (feature.startsWith('📅')) return <FaCalendarAlt />;
  if (feature.startsWith('💬')) return <FaComments />;
  if (feature.startsWith('🧘')) return <FaPrayingHands />;
  if (feature.startsWith('📝')) return <FaRegFileAlt />;
  if (feature.startsWith('🔁')) return <FaRedo />;
  if (feature.startsWith('🍎')) return <FaAppleAlt />;
  if (feature.startsWith('🎥')) return <FaVideo />;
  if (feature.startsWith('⏱️')) return <FaStopwatch />;
  if (feature.startsWith('🔗')) return <FaLink />;
  if (feature.startsWith('🏆')) return <FaTrophy />;
  if (feature.startsWith('👥')) return <FaUsers />;
  if (feature.startsWith('📈')) return <FaChartLine />;
  if (feature.startsWith('🛎️')) return <FaBell />;
  if (feature.startsWith('🔄')) return <FaSyncAlt />;
  return <FaCheckCircle />;
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

  function initialsOf(name?: string) {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  function userAvatar(user: User, size: number) {
    if (user.profile_image_url) {
      return (
        <img
          src={user.profile_image_url}
          alt={user.full_name}
          width={size}
          height={size}
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            objectFit: 'cover',
            border: '4px solid rgba(255,255,255,0.88)',
            boxShadow: '0 14px 30px rgba(15,23,42,0.14)',
          }}
        />
      );
    }

    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background:
            'linear-gradient(135deg, rgba(139,92,246,0.9), rgba(96,165,250,0.86))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 950,
          fontSize: size / 3,
          color: '#fff',
          border: '4px solid rgba(255,255,255,0.88)',
          boxShadow: '0 14px 30px rgba(15,23,42,0.14)',
        }}
      >
        {initialsOf(user.full_name)}
      </div>
    );
  }

  return (
    <section
      style={{
        width: '100%',
        borderRadius: 38,
        overflow: 'hidden',
        background:
          'linear-gradient(135deg, #faf7ff 0%, #f5f3ff 36%, #eef7ff 72%, #fdfcff 100%)',
        boxShadow:
          '0 18px 45px rgba(15,23,42,0.07), inset 0 0 0 1px rgba(255,255,255,0.45)',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at top right, rgba(139,92,246,0.08), transparent 28%), radial-gradient(circle at bottom left, rgba(96,165,250,0.08), transparent 26%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 2,
          padding: 'clamp(1rem, 3vw, 1.5rem)',
        }}
      >
        <div
          className="d-flex flex-column flex-xl-row justify-content-between align-items-xl-start"
          style={{ gap: '1rem', marginBottom: '1.25rem' }}
        >
          <div>
            <span style={pillStyle}>
              <FaUsers />
              Admin Users
            </span>

            <h2 style={titleStyle}>User management</h2>

            <p style={subtitleStyle}>
              Review member profiles, membership details, and quickly start a
              trainer message conversation.
            </p>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '0.75rem 1rem',
              borderRadius: 18,
              background: 'rgba(255,255,255,0.72)',
              border: '1px solid rgba(139,92,246,0.08)',
              color: '#475569',
              fontWeight: 850,
              boxShadow: '0 10px 24px rgba(15,23,42,0.04)',
            }}
          >
            <FaUser color="#8b5cf6" />
            {loading ? 'Loading…' : `${users.length} users`}
          </div>
        </div>

        {loading && (
          <div
            style={{
              minHeight: 260,
              borderRadius: 30,
              background:
                'linear-gradient(90deg, rgba(255,255,255,0.55), rgba(255,255,255,0.85), rgba(255,255,255,0.55))',
              border: '1px solid rgba(139,92,246,0.08)',
              boxShadow: '0 14px 36px rgba(15,23,42,0.06)',
            }}
          />
        )}

        {error && (
          <div
            style={{
              padding: '1rem',
              borderRadius: 22,
              background: 'rgba(239,68,68,0.10)',
              border: '1px solid rgba(239,68,68,0.16)',
              color: '#b91c1c',
              fontWeight: 800,
            }}
          >
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="row g-4">
            {users.map((u, idx) => (
              <div key={u.id} className="col-12 col-xl-6">
                <motion.article
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.3 }}
                  whileHover={{
                    y: -5,
                    boxShadow: '0 18px 42px rgba(15,23,42,0.10)',
                  }}
                  style={{
                    height: '100%',
                    borderRadius: 30,
                    overflow: 'hidden',
                    background:
                      'linear-gradient(180deg, rgba(255,255,255,0.92), rgba(248,250,252,0.94))',
                    border: '1px solid rgba(139,92,246,0.08)',
                    boxShadow: '0 14px 36px rgba(15,23,42,0.06)',
                  }}
                >
                  <div
                    className="d-flex flex-column flex-md-row"
                    style={{ minHeight: 220 }}
                  >
                    <div
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        width: '100%',
                        maxWidth: 220,
                        minHeight: 180,
                        background:
                          'linear-gradient(135deg, rgba(139,92,246,0.13), rgba(96,165,250,0.10))',
                        margin: '0 auto',
                        padding: '1.25rem',
                      }}
                    >
                      {userAvatar(u, 124)}
                    </div>

                    <div style={{ flex: 1, padding: '1.25rem', minWidth: 0 }}>
                      <div
                        className="d-flex justify-content-between align-items-start"
                        style={{ gap: '1rem', marginBottom: '0.8rem' }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <h3
                            style={{
                              margin: 0,
                              color: '#111827',
                              fontWeight: 950,
                              fontSize: '1.25rem',
                              letterSpacing: '-0.03em',
                            }}
                          >
                            {u.full_name}
                          </h3>

                          <p
                            style={{
                              margin: '0.35rem 0 0',
                              color: '#64748b',
                              fontWeight: 700,
                              wordBreak: 'break-word',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 7,
                            }}
                          >
                            <FaEnvelope color="#8b5cf6" />
                            {u.email}
                          </p>
                        </div>

                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '0.38rem 0.7rem',
                            borderRadius: 999,
                            background: 'rgba(139,92,246,0.10)',
                            color: '#7c3aed',
                            fontWeight: 900,
                            fontSize: '0.76rem',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <FaCrown />
                          {u.plan_name || 'Free'}
                        </span>
                      </div>

                      {u.bio && (
                        <p
                          style={{
                            color: '#64748b',
                            lineHeight: 1.65,
                            marginBottom: '1rem',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {u.bio}
                        </p>
                      )}

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          color: '#475569',
                          fontWeight: 750,
                          marginBottom: '1rem',
                        }}
                      >
                        <FaCrown color="#f59e0b" />
                        {u.plan_name || 'Free'}{' '}
                        {u.plan_price ? `($${u.plan_price}/mo)` : ''}
                      </div>

                      <div className="d-flex flex-wrap" style={{ gap: '0.65rem' }}>
                        <button
                          type="button"
                          onClick={() => onMessageUser(u)}
                          style={primaryButtonStyle}
                        >
                          <FaEnvelope />
                          Message
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedUser(u)}
                          style={secondaryButtonStyle}
                        >
                          <FaUser />
                          View Profile
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.article>
              </div>
            ))}

            {users.length === 0 && (
              <div className="col-12">
                <div
                  style={{
                    borderRadius: 30,
                    padding: '2rem',
                    background: 'rgba(255,255,255,0.82)',
                    border: '1px solid rgba(139,92,246,0.08)',
                    textAlign: 'center',
                    color: '#64748b',
                    fontWeight: 800,
                  }}
                >
                  No users found.
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedUser && (
          <UserProfileModal
            user={selectedUser}
            userAvatar={userAvatar}
            onClose={() => setSelectedUser(null)}
            onMessage={() => onMessageUser(selectedUser)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

function UserProfileModal({
  user,
  userAvatar,
  onClose,
  onMessage,
}: {
  user: User;
  userAvatar: (user: User, size: number) => React.ReactNode;
  onClose: () => void;
  onMessage: () => void;
}) {
  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={overlayStyle}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.22 }}
        className="modal-dialog modal-dialog-centered"
        style={{ maxWidth: 620 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={modalCardStyle}>
          <div
            style={{
              padding: '2rem 1.25rem 1.5rem',
              background:
                'linear-gradient(135deg, #8b5cf6 0%, #6366f1 48%, #60a5fa 100%)',
              color: '#ffffff',
            }}
          >
            <div className="d-flex justify-content-between align-items-start gap-3">
              <div className="d-flex align-items-center" style={{ gap: '1rem' }}>
                {userAvatar(user, 82)}

                <div>
                  <span
                    style={{
                      display: 'inline-flex',
                      padding: '0.35rem 0.7rem',
                      borderRadius: 999,
                      background: 'rgba(255,255,255,0.16)',
                      color: '#ffffff',
                      fontWeight: 850,
                      fontSize: '0.72rem',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      marginBottom: '0.6rem',
                    }}
                  >
                    User Profile
                  </span>

                  <h5 style={{ margin: 0, fontWeight: 950 }}>
                    {user.full_name}
                  </h5>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 14,
                  border: '1px solid rgba(255,255,255,0.28)',
                  background: 'rgba(255,255,255,0.16)',
                  color: '#ffffff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FaTimes />
              </button>
            </div>
          </div>

          <div style={{ padding: '1.25rem' }}>
            <div
              style={{
                padding: '1rem',
                borderRadius: 22,
                background: 'linear-gradient(135deg, #faf7ff 0%, #eef7ff 100%)',
                border: '1px solid rgba(139,92,246,0.08)',
                display: 'grid',
                gap: '0.75rem',
                color: '#475569',
                fontWeight: 700,
              }}
            >
              <InfoRow icon={<FaEnvelope />} label="Email" value={user.email} />
              <InfoRow
                icon={<FaPhone />}
                label="Phone"
                value={user.phone_number || 'N/A'}
              />
              <InfoRow
                icon={<FaMapMarkerAlt />}
                label="Address"
                value={user.address || 'N/A'}
              />
              <InfoRow
                icon={<FaCrown />}
                label="Plan"
                value={`${user.plan_name || 'Free'} ${
                  user.plan_price ? `($${user.plan_price}/mo)` : ''
                }`}
              />
            </div>

            {user.plan_features && user.plan_features.length > 0 && (
              <div style={{ marginTop: '1.25rem' }}>
                <h5
                  style={{
                    color: '#111827',
                    fontWeight: 950,
                    marginBottom: '0.9rem',
                  }}
                >
                  Plan Features
                </h5>

                <div style={{ display: 'grid', gap: '0.65rem' }}>
                  {user.plan_features.map((f, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.65rem',
                        padding: '0.75rem 0.85rem',
                        borderRadius: 18,
                        background: 'rgba(255,255,255,0.72)',
                        border: '1px solid rgba(139,92,246,0.08)',
                        color: '#475569',
                        fontWeight: 700,
                        lineHeight: 1.55,
                      }}
                    >
                      <span style={featureIconStyle}>{getFeatureIcon(f)}</span>
                      <span>{f.replace(/^([\p{Emoji}\u200d\s]+)/u, '')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {user.bio && (
              <div
                style={{
                  marginTop: '1.25rem',
                  padding: '1rem',
                  borderRadius: 22,
                  background: 'rgba(255,255,255,0.72)',
                  border: '1px solid rgba(139,92,246,0.08)',
                  color: '#64748b',
                  lineHeight: 1.75,
                }}
              >
                <strong style={{ color: '#111827' }}>Bio:</strong> {user.bio}
              </div>
            )}

            <div
              className="d-flex justify-content-between flex-wrap"
              style={{ gap: '0.75rem', marginTop: '1.25rem' }}
            >
              <button type="button" onClick={onClose} style={secondaryButtonStyle}>
                Close
              </button>

              <button type="button" onClick={onMessage} style={primaryButtonStyle}>
                <FaEnvelope />
                Message User
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="d-flex align-items-start" style={{ gap: '0.65rem' }}>
      <span style={featureIconStyle}>{icon}</span>
      <span>
        <strong style={{ color: '#111827' }}>{label}:</strong> {value}
      </span>
    </div>
  );
}

const pillStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 7,
  padding: '0.4rem 0.75rem',
  borderRadius: 999,
  background: 'rgba(139,92,246,0.10)',
  color: '#8b5cf6',
  fontWeight: 800,
  fontSize: '0.76rem',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  marginBottom: '0.7rem',
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  color: '#111827',
  fontSize: 'clamp(1.55rem, 3vw, 2.35rem)',
  fontWeight: 950,
  letterSpacing: '-0.04em',
};

const subtitleStyle: React.CSSProperties = {
  margin: '0.55rem 0 0',
  color: '#64748b',
  lineHeight: 1.7,
  maxWidth: 760,
};

const primaryButtonStyle: React.CSSProperties = {
  minHeight: 44,
  padding: '0.8rem 1rem',
  borderRadius: 15,
  border: '1px solid transparent',
  background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
  color: '#ffffff',
  fontWeight: 850,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  cursor: 'pointer',
  boxShadow: '0 12px 26px rgba(139,92,246,0.18)',
};

const secondaryButtonStyle: React.CSSProperties = {
  minHeight: 44,
  padding: '0.8rem 1rem',
  borderRadius: 15,
  border: '1px solid rgba(148,163,184,0.26)',
  background: '#ffffff',
  color: '#475569',
  fontWeight: 850,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  cursor: 'pointer',
};

const featureIconStyle: React.CSSProperties = {
  width: 24,
  height: 24,
  minWidth: 24,
  borderRadius: 999,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(139,92,246,.12)',
  color: '#8b5cf6',
  marginTop: 1,
};

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 5000,
  background: 'rgba(15,23,42,0.56)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  overflowY: 'auto',
  padding: '1rem',
};

const modalCardStyle: React.CSSProperties = {
  borderRadius: 28,
  overflow: 'hidden',
  background: '#ffffff',
  border: 'none',
  boxShadow: '0 28px 80px rgba(15,23,42,0.22)',
};

{/*
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
//import Image from 'next/image';
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

  function userAvatar(user: User, size: number) {
    if (user.profile_image_url) {
      return (
      <img
        src={user.profile_image_url}
        alt={user.full_name}
        width={size}
        height={size}
        className="rounded-circle object-fit-cover"
       />

      );
    }
    // fallback: initials inside a circle
    const initials = user.full_name
      ? user.full_name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
      : '?';
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: '#ccc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: size / 2.5,
          color: '#fff',
        }}
      >
        {initials}
      </div>
    );
  }

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
              {userAvatar(u, 120)}
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
                  {userAvatar(selectedUser, 80)}
                  <div className="ms-3">
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

*/}


