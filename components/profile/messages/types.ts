// components/profile/messages/types.ts

export type UIMessage = {
  id: string;                
  sender: 'admin' | 'user';  
  content: string;
  timestamp: string;        
};

export type MessageThread = {
  id?: string;               
  admin_id?: string;         
  sender: string;             
  subject: string;

  // Optional metadata used by Inbox rendering:
  preview?: string;          
  timestamp?: string;        
  unread_count?: number;  

  // Messages are loaded lazily by ChatWindow:
  messages?: UIMessage[];
};
