// components/admin/messages/types.ts

export type UIMessage = {
  id: string;
  sender: 'admin' | 'user';
  content: string;
  timestamp: string;
  is_toxic?: boolean;
  toxicity_score?: number;
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

