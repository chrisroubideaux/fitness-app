// components/profile/messages/NotificationsPanel.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

const labelMap = {
  tip: 'Daily Tip',
  guide: 'Workout Guide',
  blog: 'Blog',
};

const notifications: Notification[] = [
  {
    id: 1,
    type: 'tip',
    title: 'Hydration Tip',
    content:
      'Drink at least 8 cups of water throughout the day to stay energized and aid recovery.',
  },
  {
    id: 2,
    type: 'guide',
    title: 'Beginner Leg Day Guide',
    content:
      '3 sets of squats, lunges, and calf raises. Rest 60 sec between each.',
  },
  {
    id: 3,
    type: 'blog',
    title: 'The Science of Recovery',
    content:
      'Learn how sleep and nutrition influence your muscle recovery post-workout.',
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
              display: 'inline-block',
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
            Notifications
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
            Updates, tips, and training guidance
          </h2>

          <p
            style={{
              margin: '0.55rem 0 0',
              color: '#64748b',
              lineHeight: 1.7,
              maxWidth: 720,
            }}
          >
            Stay on track with helpful reminders, wellness tips, and simple
            guides designed to support your progress.
          </p>
        </div>

        <div style={{ display: 'grid', gap: '1rem' }}>
          {notifications.map((note, index) => {
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
                          fontSize: '1.35rem',
                        }}
                      >
                        {emojiMap[note.type]}
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
                      </div>
                    </div>

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
                        fontWeight: 900,
                      }}
                    >
                      ▼
                    </motion.span>
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
                          padding: '0 1rem 1rem 4.95rem',
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