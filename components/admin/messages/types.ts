// components/admin/messages/types.ts
// components/admin/messages/types.ts
export type UIMessage = {
  id: string;
  sender: 'admin' | 'user';
  content: string;
  timestamp: string;
};

export type MessageThread = {
  id?: string;             
  user_id?: string;        
  admin_id?: string;       
  sender: string;          
  subject: string;
  preview?: string;        
  timestamp?: string;      
  unread_count?: number;   
  messages?: UIMessage[];

  // ✅ both optional so no TS errors
  user_profile_image_url?: string;
  admin_profile_image_url?: string;
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