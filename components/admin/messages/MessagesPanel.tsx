// components/admin/users/UsersPanel.tsx

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import InboxTab from './InboxTab';
import NewMessageTab from './NewMessageTab';
import ChatWindow from './ChatWindow';
import { MessageThread, UIMessage } from './types';

export default function UsersPanel() {
  const [activeSubTab, setActiveSubTab] = useState<'inbox' | 'new' | 'chat'>('inbox');
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);

  // Open an existing conversation
  const handleOpenThread = (thread: MessageThread) => {
    setSelectedThread(thread);
    setActiveSubTab('chat');
  };

  // Start a new conversation with a specific admin
  const startChatWithAdmin = (
    adminId: string,
    label: string = 'Coach/Admin',
    subject: string = 'New conversation'
  ) => {
    const newThread: MessageThread = {
      admin_id: adminId,
      sender: label,
      subject,
      messages: [] as UIMessage[],
      // ✅ both avatars provided, no type errors
      admin_profile_image_url: '/admin-avatar.png',
      user_profile_image_url: '/user-avatar.png',
    };
    setSelectedThread(newThread);
    setActiveSubTab('chat');
  };

  return (
    <div className="panel-wrapper">
      {/* Navigation buttons */}
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

      {/* Tabs */}
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

