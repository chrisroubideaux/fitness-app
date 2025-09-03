// components/profile/messages/types.ts
// components/profile/messages/types.ts
export type UIMessage = {
  id: string; // uuid string from API
  sender: 'admin' | 'user'; // only allow these two
  content: string;
  timestamp: string;
};

export type MessageThread = {
  id?: string;        // conversation_id
  admin_id?: string;  // if starting a new convo
  sender: string;     // UI label
  subject: string;
  timestamp?: string;
  messages?: UIMessage[];
};
