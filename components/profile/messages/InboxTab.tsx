//
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
