// components/admin/messages/NotificationsPanel.tsx
// components/admin/messages/NotificationsPanel.tsx

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiActivity,
  FiTrendingUp,
  FiUsers,
  FiAlertCircle,
  FiChevronDown,
} from 'react-icons/fi';

type AdminNotification = {
  id: number;
  type: 'activity' | 'growth' | 'users' | 'alert';
  title: string;
  summary: string;
  content: string;
  metric?: string;
};

const iconMap = {
  activity: <FiActivity />,
  growth: <FiTrendingUp />,
  users: <FiUsers />,
  alert: <FiAlertCircle />,
};

const labelMap = {
  activity: 'Activity',
  growth: 'Growth',
  users: 'Users',
  alert: 'Alert',
};

const analyticsUpdates: AdminNotification[] = [
  {
    id: 1,
    type: 'activity',
    title: 'Workout Activity Spike',
    summary: 'User workout sessions increased this week.',
    content:
      'Members completed more logged workout sessions than usual. This could indicate stronger engagement with workout plans and calendar-based training.',
    metric: '+18%',
  },
  {
    id: 2,
    type: 'users',
    title: 'New Member Engagement',
    summary: 'New users are interacting with profile tools.',
    content:
      'Recent signups are using workout plans, calendar scheduling, and membership features. This is a good area to monitor for retention.',
    metric: '24 users',
  },
  {
    id: 3,
    type: 'growth',
    title: 'Membership Interest',
    summary: 'Plan views and membership activity are trending upward.',
    content:
      'Users are spending more time reviewing available plans. Consider highlighting Pro or Elite benefits more clearly on the plans page.',
    metric: '+12%',
  },
  {
    id: 4,
    type: 'alert',
    title: 'Pending Appointments',
    summary: 'Some client bookings may need admin review.',
    content:
      'Pending appointments should be reviewed so users receive timely confirmation, decline, or rescheduling updates.',
    metric: 'Review',
  },
];

export default function NotificationsPanel() {
  const [openIds, setOpenIds] = useState<number[]>([]);

  const toggleCollapse = (id: number) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

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
        <div style={{ marginBottom: '1.4rem' }}>
          <span
            style={{
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
            }}
          >
            <FiActivity />
            Admin Analytics
          </span>

          <h2
            style={{
              margin: 0,
              color: '#111827',
              fontSize: 'clamp(1.55rem, 3vw, 2.35rem)',
              fontWeight: 950,
              letterSpacing: '-0.04em',
            }}
          >
            Platform insights and alerts
          </h2>

          <p
            style={{
              margin: '0.55rem 0 0',
              color: '#64748b',
              lineHeight: 1.7,
              maxWidth: 760,
            }}
          >
            Static admin updates for tracking user engagement, memberships,
            appointments, and overall platform activity.
          </p>
        </div>

        <div style={{ display: 'grid', gap: '1rem' }}>
          {analyticsUpdates.map((note, index) => {
            const open = openIds.includes(note.id);

            return (
              <motion.article
                key={note.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.06 }}
                style={{
                  borderRadius: 28,
                  overflow: 'hidden',
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,0.92), rgba(248,250,252,0.92))',
                  border: open
                    ? '1px solid rgba(139,92,246,0.18)'
                    : '1px solid rgba(139,92,246,0.08)',
                  boxShadow: open
                    ? '0 18px 42px rgba(15,23,42,0.10)'
                    : '0 12px 28px rgba(15,23,42,0.05)',
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleCollapse(note.id)}
                  style={{
                    width: '100%',
                    border: 'none',
                    background: 'transparent',
                    padding: '1rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div
                    className="d-flex align-items-center justify-content-between"
                    style={{ gap: '1rem' }}
                  >
                    <div
                      className="d-flex align-items-center"
                      style={{ gap: '0.85rem', minWidth: 0 }}
                    >
                      <div
                        style={{
                          width: 52,
                          height: 52,
                          minWidth: 52,
                          borderRadius: 18,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background:
                            'linear-gradient(135deg, rgba(139,92,246,0.14), rgba(96,165,250,0.12))',
                          color: '#8b5cf6',
                          fontSize: '1.25rem',
                        }}
                      >
                        {iconMap[note.type]}
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            display: 'inline-flex',
                            marginBottom: 5,
                            padding: '0.25rem 0.55rem',
                            borderRadius: 999,
                            background: 'rgba(139,92,246,0.09)',
                            color: '#8b5cf6',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                          }}
                        >
                          {labelMap[note.type]}
                        </div>

                        <h3
                          style={{
                            margin: 0,
                            color: '#111827',
                            fontSize: '1rem',
                            fontWeight: 900,
                            lineHeight: 1.35,
                          }}
                        >
                          {note.title}
                        </h3>

                        <p
                          style={{
                            margin: '0.35rem 0 0',
                            color: '#64748b',
                            fontSize: '0.9rem',
                            lineHeight: 1.5,
                          }}
                        >
                          {note.summary}
                        </p>
                      </div>
                    </div>

                    <div
                      className="d-flex align-items-center"
                      style={{ gap: '0.6rem' }}
                    >
                      {note.metric && (
                        <span
                          style={{
                            display: 'inline-flex',
                            padding: '0.35rem 0.65rem',
                            borderRadius: 999,
                            background: 'rgba(96,165,250,0.12)',
                            color: '#2563eb',
                            fontWeight: 900,
                            fontSize: '0.78rem',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {note.metric}
                        </span>
                      )}

                      <motion.span
                        animate={{ rotate: open ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          width: 34,
                          height: 34,
                          minWidth: 34,
                          borderRadius: 13,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: open
                            ? 'rgba(139,92,246,0.12)'
                            : 'rgba(148,163,184,0.10)',
                          color: open ? '#8b5cf6' : '#64748b',
                        }}
                      >
                        <FiChevronDown />
                      </motion.span>
                    </div>
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: 'easeOut' }}
                    >
                      <div
                        style={{
                          padding: '0 1rem 1rem',
                          color: '#64748b',
                          lineHeight: 1.75,
                          fontSize: '0.96rem',
                        }}
                      >
                        {note.content}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
{/*

'use client';

import { useState } from 'react';

type Notification = {
  id: number;
  type: 'tip' | 'guide' | 'blog';
  title: string;
  content: string;
};

const emojiMap = {
  tip: '💡',
  guide: '📋',
  blog: '📰',
};

export default function NotificationsPanel() {
  const [openIds, setOpenIds] = useState<number[]>([]);

  const notifications: Notification[] = [
    {
      id: 1,
      type: 'tip',
      title: 'Hydration Tip',
      content: 'Drink at least 8 cups of water throughout the day to stay energized and aid recovery.',
    },
    {
      id: 2,
      type: 'guide',
      title: 'Beginner Leg Day Guide',
      content: '3 sets of squats, lunges, and calf raises. Rest 60 sec between each.',
    },
    {
      id: 3,
      type: 'blog',
      title: 'The Science of Recovery',
      content: 'Learn how sleep and nutrition influence your muscle recovery post-workout.',
    },
  ];

  const toggleCollapse = (id: number) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="notifications-panel p-3 rounded shadow-sm bg-white">
      <h5 className="mb-3">📬 Notifications</h5>
      <ul className="list-group">
        {notifications.map((note) => (
          <li key={note.id} className="list-group-item">
            <div
              className="d-flex justify-content-between align-items-center"
              role="button"
              onClick={() => toggleCollapse(note.id)}
            >
              <span>
                {emojiMap[note.type]} <strong>{note.title}</strong>
              </span>
              <span className="text-muted small">
                {openIds.includes(note.id) ? '▲' : '▼'}
              </span>
            </div>
            {openIds.includes(note.id) && (
              <div className="mt-2 text-muted small">{note.content}</div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

*/}