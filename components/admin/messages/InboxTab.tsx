// components/admin/messages/InboxTab.tsx
'use client';

type Message = {
  id: number;
  sender: 'admin' | 'user';
  content: string;
  timestamp: string;
};

type MessageThread = {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  timestamp: string;
  messages: Message[];
};

type InboxProps = {
  onMessageClick: (thread: MessageThread) => void;
};

export default function InboxTab({ onMessageClick }: InboxProps) {
  const mockThreads: MessageThread[] = Array.from({ length: 5 }, (_, i) => ({
    id: `${i + 1}`,
    sender: i % 2 === 0 ? 'Coach Lena' : 'Admin Team',
    subject: `Message Subject ${i + 1}`,
    preview: `This is a short preview of the message content ${i + 1}.`,
    timestamp: new Date(Date.now() - i * 3600000).toLocaleString(),
    messages: [
      {
        id: 1,
        sender: 'admin',
        content: 'Initial message content',
        timestamp: '10:00 AM',
      },
      {
        id: 2,
        sender: 'user',
        content: 'User reply content',
        timestamp: '10:01 AM',
      },
    ],
  }));

  return (
    <div className="inbox-wrapper bg-transparent">
      <h6 className="mb-3">Inbox</h6>
      <ul className="list-group">
        {mockThreads.map((thread) => (
          <li
            key={thread.id}
            className="list-group-item list-group-item-action bg-transparent"
            onClick={() => onMessageClick(thread)}
            style={{ cursor: 'pointer' }}
          >
            <div className="d-flex justify-content-between">
              <div>
                <strong>{thread.sender}</strong> — {thread.subject}
                <p className="mb-0 text-muted" style={{ fontSize: '0.85rem' }}>{thread.preview}</p>
              </div>
              <small className="text-muted">{thread.timestamp}</small>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
