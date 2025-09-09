// components/admin/messages/MessagesPanel.tsx

// components/admin/messages/MessagesPanel.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import InboxTab from './InboxTab';
import NewMessageTab from './NewMessageTab';
import ChatWindow from './ChatWindow';
import { MessageThread, UIMessage } from './types';

type MessagesPanelProps = {
  // optional: jump straight into a chat
  initialThread?: MessageThread | null;
  initialTab?: 'inbox' | 'new' | 'chat';
};

export default function MessagesPanel({
  initialThread = null,
  initialTab = 'inbox',
}: MessagesPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<'inbox' | 'new' | 'chat'>(initialTab);
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(initialThread);

  // if parent changes initialThread, sync it
  useEffect(() => {
    if (initialThread) {
      setSelectedThread(initialThread);
      setActiveSubTab('chat');
    }
  }, [initialThread]);

  // Open an existing conversation (from Inbox)
  const handleOpenThread = (thread: MessageThread) => {
    setSelectedThread(thread);
    setActiveSubTab('chat');
  };

  // Start a new conversation with a specific admin
  const startChatWithAdmin = (
    adminId: string,
    label = 'Coach/Admin',
    subject = 'New conversation'
  ) => {
    setSelectedThread({
      admin_id: adminId,
      sender: label,
      subject,
      messages: [] as UIMessage[],
    });
    setActiveSubTab('chat');
  };

  return (
    <div className="panel-wrapper">
      {/* tab buttons */}
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

      {/* animated tab content */}
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

/*

// components/admin/messages/MessagesPanel.tsx

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import InboxTab from './InboxTab';
import NewMessageTab from './NewMessageTab';
import ChatWindow from './ChatWindow';
import { MessageThread, UIMessage } from './types';

export default function MessagesPanel() {
  const [activeSubTab, setActiveSubTab] = useState<'inbox' | 'new' | 'chat'>('inbox');
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);

  // Open an existing conversation (from Inbox)
  const handleOpenThread = (thread: MessageThread) => {
    setSelectedThread(thread);
    setActiveSubTab('chat');
  };

  // Start a new conversation with a specific admin
  const startChatWithAdmin = (
    adminId: string,
    label = 'Coach/Admin',
    subject = 'New conversation'
  ) => {
    setSelectedThread({
      admin_id: adminId, // use admin_id instead of id
      sender: label,
      subject,
      messages: [] as UIMessage[],
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



*/