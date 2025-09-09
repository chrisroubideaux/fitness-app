// components/admin/messages/types.ts

export type UIMessage = {
  id: string;
  sender: 'admin' | 'user';
  content: string;
  timestamp: string;
};

export type MessageThread = {
  id?: string;          // conversation id
  user_id?: string;     // for admin side (who the admin is chatting with)
  admin_id?: string;    // for user side  (which admin/coach)
  sender: string;       // display name in the list
  subject: string;
  preview?: string;     // optional last-message preview
  timestamp?: string;   // formatted last_message_at
  unread_count?: number; // <-- add this for the red badge
  messages?: UIMessage[];
};




/*
export type UIMessage = {
  id: string;
  sender: 'admin' | 'user';
  content: string;
  timestamp: string;
};

export type MessageThread = {
  id?: string;
  user_id?: string;   // for admin side
  admin_id?: string;  // for user side
  sender: string;
  subject: string;
  preview?: string;   // 👈 added
  timestamp?: string; // 👈 added
  messages?: UIMessage[];
};

*/