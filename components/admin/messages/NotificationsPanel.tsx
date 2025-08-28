// components/admin/messages/NotificationsPanel.tsx
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
