// components/profile/messages/MessagesPanel.tsx
'use client';

import { motion } from 'framer-motion';
import ChatWindow from './ChatWindow';

type MessagesPanelProps = {
  userName?: string;
};

export default function MessagesPanel({ userName = '' }: MessagesPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="mb-3 text-start">
        <h4
          className="fw-semibold mb-1"
          style={{
            background:
              'linear-gradient(90deg, rgba(218,112,255,1) 0%, rgba(255,128,171,1) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Chat with Lena
        </h4>
        <p className="text-muted mb-0">
          Your AI coach is here to help with training, recovery, nutrition, and plan questions.
        </p>
      </div>

      <ChatWindow userName={userName} />
    </motion.div>
  );
}

{/*
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

  // Open an existing conversation from Inbox
  const handleOpenThread = (thread: MessageThread) => {
    setSelectedThread(thread);
    setActiveSubTab('chat');
  };

  // Start a new chat with an admin
  const handleStartNewChat = (
    adminId: string,
    label = 'Coach/Admin',
    subject = 'New conversation'
  ) => {
    setSelectedThread({
      id: '', // will be created once first message is sent
      admin_id: adminId,
      sender: label,
      subject,
      messages: [],
    });
    setActiveSubTab('chat');
  };

  // Reset when conversation deleted
  const handleThreadDeleted = (threadId: string) => {
    if (selectedThread?.id === threadId) {
      setSelectedThread(null);
      setActiveSubTab('inbox');
    }
  };

  const handleAllThreadsDeleted = () => {
    setSelectedThread(null);
    setActiveSubTab('inbox');
  };

  return (
    <div className="panel-wrapper shadow-lg">
     
      <div className="d-flex justify-content-start gap-2 mb-3">
        <button
          className={`btn btn-sm btn-${activeSubTab === 'chat' ? 'primary' : 'outline-primary'}`}
          onClick={() => (selectedThread ? setActiveSubTab('chat') : null)}
          disabled={!selectedThread}
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
            <ChatWindow
              selectedThread={selectedThread}
              onDeleteThread={handleThreadDeleted}
              onDeleteAllThreads={handleAllThreadsDeleted}
            />
          )}

          {activeSubTab === 'inbox' && (
            <InboxTab onMessageClick={handleOpenThread} />
          )}

          {activeSubTab === 'new' && (
            <NewMessageTab onStart={handleStartNewChat} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

*/}