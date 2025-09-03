// components/admin/messages/types.ts

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
