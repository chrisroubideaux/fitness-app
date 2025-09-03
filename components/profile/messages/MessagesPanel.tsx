// components/profile/messages/MessagesPanel.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import InboxTab from './InboxTab';
import NewMessageTab from './NewMessageTab';
import ChatWindow from './ChatWindow';
import { MessageThread } from './types';

export default function MessagesPanel() {
  const [activeSubTab, setActiveSubTab] = useState<'inbox' | 'new' | 'chat'>('inbox');
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);

  // Open an existing conversation (from Inbox)
  const handleOpenThread = (thread: MessageThread) => {
    setSelectedThread(thread);
    setActiveSubTab('chat');
  };

  // Start a new chat with an admin by admin_id
  const startChatWithAdmin = (
    adminId: string,
    label = 'Coach/Admin',
    subject = 'New conversation'
  ) => {
    setSelectedThread({
      admin_id: adminId,
      sender: label,
      subject,
      messages: [], // ChatWindow will create/fetch on first send
    });
    setActiveSubTab('chat');
  };

  return (
    <div className="panel-wrapper">
      <div className="d-flex justify-content-start gap-2 mb-3">
        <button
          className={`btn btn-sm btn-${activeSubTab === 'chat' ? 'primary' : 'outline-primary'}`}
          onClick={() => (selectedThread ? setActiveSubTab('chat') : null)}
          title={selectedThread ? 'Open Message Box' : 'Select a conversation first'}
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

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeSubTab === 'chat' && selectedThread && (
            <ChatWindow selectedThread={selectedThread} />
          )}

          {activeSubTab === 'inbox' && (
            <InboxTab onMessageClick={handleOpenThread} />
          )}

          {activeSubTab === 'new' && (
            <NewMessageTab onStart={startChatWithAdmin} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}





{/*

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import InboxTab from './InboxTab';
import NewMessageTab from './NewMessageTab';
import ChatWindow from './ChatWindow';

type MessageThread = {
  id: string;
  sender: string;
  subject: string;
  messages: {
    id: number;
    sender: 'admin' | 'user';
    content: string;
    timestamp: string;
  }[];
};

export default function MessagesPanel() {
  const [activeSubTab, setActiveSubTab] = useState<'inbox' | 'new' | 'chat'>('inbox');
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);

  const handleOpenThread = (thread: MessageThread) => {
    setSelectedThread(thread);
    setActiveSubTab('chat');
  };

  return (
    <div className="panel-wrapper">
      <div className="d-flex justify-content-start gap-2 mb-3">
        <button className={`btn btn-sm btn-${activeSubTab === 'chat' ? 'primary' : 'outline-primary'}`} onClick={() => setActiveSubTab('chat')}>
          Message Box
        </button>
        <button className={`btn btn-sm btn-${activeSubTab === 'inbox' ? 'primary' : 'outline-primary'}`} onClick={() => setActiveSubTab('inbox')}>
          Inbox
        </button>
        <button className={`btn btn-sm btn-${activeSubTab === 'new' ? 'primary' : 'outline-primary'}`} onClick={() => setActiveSubTab('new')}>
          New Message
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeSubTab === 'chat' && selectedThread && <ChatWindow selectedThread={selectedThread} />}
          {activeSubTab === 'inbox' && <InboxTab onMessageClick={handleOpenThread} />}
          {activeSubTab === 'new' && <NewMessageTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

*/}
