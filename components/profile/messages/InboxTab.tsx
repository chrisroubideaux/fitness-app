// components/profile/messages/InboxTab.tsx

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
    <div className="inbox-wrapper">
      <h6 className="mb-3">Inbox</h6>
      <ul className="list-group">
        {mockThreads.map((thread) => (
          <li
            key={thread.id}
            className="list-group-item list-group-item-action"
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




/*
'use client';

import { useState } from 'react';

type Message = {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  timestamp: string;
};

const mockMessages: Message[] = Array.from({ length: 20 }, (_, i) => ({
  id: `${i + 1}`,
  sender: i % 2 === 0 ? 'Coach Lena' : 'Admin Team',
  subject: `Message Subject ${i + 1}`,
  preview: `This is a short preview of message #${i + 1}.`,
  timestamp: new Date(Date.now() - i * 3600000).toLocaleString(),
}));

const MESSAGES_PER_PAGE = 5;

export default function InboxTab() {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(mockMessages.length / MESSAGES_PER_PAGE);
  const currentMessages = mockMessages.slice(
    (currentPage - 1) * MESSAGES_PER_PAGE,
    currentPage * MESSAGES_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="inbox-wrapper">
      <h5 className="mb-3">Inbox</h5>

      <ul className="list-group mb-4">
        {currentMessages.map((msg) => (
          <li key={msg.id} className="list-group-item">
            <div className="d-flex justify-content-between">
              <div>
                <strong>{msg.sender}</strong> — <span>{msg.subject}</span>
                <p className="mb-0 text-muted" style={{ fontSize: '0.85rem' }}>
                  {msg.preview}
                </p>
              </div>
              <small className="text-muted text-end">{msg.timestamp}</small>
            </div>
          </li>
        ))}
      </ul>

      <div className="d-flex justify-content-center">
        <nav>
          <ul className="pagination pagination-sm mb-0">
            {Array.from({ length: totalPages }, (_, i) => (
              <li
                key={i}
                className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}
              >
                <button
                  className="page-link"
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

*/
