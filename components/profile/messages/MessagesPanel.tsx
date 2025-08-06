// components/profile/messages/MessagesPanel.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import InboxTab from './InboxTab';
import NewMessageTab from './NewMessageTab';
import ChatWindow from './ChatWindow';

export default function MessagesPanel() {
  const [activeSubTab, setActiveSubTab] = useState<'inbox' | 'new' | 'chat'>('chat');

  return (
    <div className="panel-wrapper">
      {/* Sub Tab Controls */}
      <div className="d-flex justify-content-start gap-2 mb-3">
        <button
          className={`btn btn-sm btn-${activeSubTab === 'chat' ? 'primary' : 'outline-primary'}`}
          onClick={() => setActiveSubTab('chat')}
        >
          Message Box
        </button>
        <button
          className={`btn btn-sm btn-${activeSubTab === 'inbox' ? 'primary' : 'outline-primary'}`}
          onClick={() => setActiveSubTab('inbox')}
        >
          Inbox
        </button>
        <button
          className={`btn btn-sm btn-${activeSubTab === 'new' ? 'primary' : 'outline-primary'}`}
          onClick={() => setActiveSubTab('new')}
        >
          New Message
        </button>
      </div>

      {/* Panel Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeSubTab === 'chat' && <ChatWindow />}
          {activeSubTab === 'inbox' && <InboxTab />}
          {activeSubTab === 'new' && <NewMessageTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
