// components/profile/messages/types.ts

export type UIMessage = {
  id: string;                 // uuid from API
  sender: 'admin' | 'user';   // message author
  content: string;
  timestamp: string;          // display-ready (e.g., "10:26 PM")
};

export type MessageThread = {
  id?: string;                // conversation_id (if it exists)
  admin_id?: string;          // starting a new convo target
  sender: string;             // label in list (e.g., admin name)
  subject: string;

  // Optional metadata used by Inbox rendering:
  preview?: string;           // last message preview (optional)
  timestamp?: string;         // raw ISO string from backend (format at render)
  unread_count?: number;      // per-viewer unread counter

  // Messages are loaded lazily by ChatWindow:
  messages?: UIMessage[];
};




/*
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
*/