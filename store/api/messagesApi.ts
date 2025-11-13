// store/api/messagesApi.ts
import axios, { AxiosInstance } from "axios";

export type UUID = string;

export type Conversation = {
  id: UUID;
  user_id: UUID | null;
  admin_id: UUID | null;
  peer_display_name: string;
  unread_count: number;
  last_message_at: string | null;
  created_at: string;
  user_profile_image_url?: string | null;
  admin_profile_image_url?: string | null;
};

export type Message = {
  id: UUID;
  conversation_id: UUID;
  sender_role: "user" | "admin";
  body: string;
  created_at: string;
  read_by_user_at?: string | null;
  read_by_admin_at?: string | null;
};

export type SendResponse = {
  message: Message;
  conversation: Conversation;
  auto_reply?: Message | null;
  mood?: { label?: string | null; score?: number | null } | null;
};

const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000")
  .replace(/\/+$/, "");

const api: AxiosInstance = axios.create({
  baseURL: `${apiBase}/api/messages`,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

// 🔐 Attach token
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("authToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🚨 Expired token handling
api.interceptors.response.use(
  (r) => r,
  (err) => {
    const status = err.response?.status;
    const msg = String(
      err.response?.data?.error || err.response?.data?.message || ""
    );
    if (status === 401 || /token expired/i.test(msg)) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
        alert("Your session expired. Please log in again.");
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

/* -------------------------------------------------------
   HELPERS
--------------------------------------------------------*/

// Detect role (user/admin)
function getRole(): "admin" | "user" {
  if (typeof window === "undefined") return "user";
  return localStorage.getItem("authRole") === "admin" ? "admin" : "user";
}

// Attach sender_role
function withSenderRole(payload: any) {
  return { ...payload, sender_role: getRole() };
}

// ❗Remove undefined keys before POSTing
function stripUndefined(payload: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(payload).filter(([_, v]) => v !== undefined && v !== null)
  );
}

/* -------------------------------------------------------
   API
--------------------------------------------------------*/

export const messagesApi = {
  /* ----------------------
     Conversations
  -----------------------*/

  async listConversations(params?: { limit?: number; offset?: number }) {
    const res = await api.get<Conversation[]>("/conversations", {
      params,
    });
    return res.data;
  },

  async createOrFetchConversation(payload: { admin_id?: UUID; user_id?: UUID }) {
    const clean = stripUndefined(payload); // <-- FIXED RIGHT HERE
    const res = await api.post<Conversation>("/conversations", clean);
    return res.data;
  },

  async startConversationWithUser(user_id: UUID) {
    return this.createOrFetchConversation({ user_id });
  },

  async startConversationWithAdmin(admin_id: UUID) {
    return this.createOrFetchConversation({ admin_id });
  },

  async hideConversation(conversation_id: UUID, mode: "me" | "everyone" = "me") {
    const res = await api.delete<{ ok: true }>(
      `/conversations/${conversation_id}`,
      { params: { for: mode } }
    );
    return res.data;
  },

  /* ----------------------
     Messages
  -----------------------*/

  async listMessages(conversation_id: UUID, params?: { limit?: number; before?: string }) {
    const res = await api.get<Message[]>(
      `/conversations/${conversation_id}/messages`,
      { params }
    );
    return res.data;
  },

  async markRead(conversation_id: UUID) {
    const res = await api.post<{ ok: true; read_at: string }>(
      `/conversations/${conversation_id}/read`,
      {}
    );
    return res.data;
  },

  async send(payload: {
    body: string;
    conversation_id?: UUID;
    admin_id?: UUID;
    user_id?: UUID;
  }) {
    let clean = stripUndefined(payload);

    // attach sender_role automatically
    clean = withSenderRole(clean);

    // admin NEVER sends admin_id
    if (getRole() === "admin") {
      delete clean.admin_id;
    }

    const res = await api.post<SendResponse>("/send", clean);
    return res.data;
  },

  async deleteMessage(
    message_id: UUID,
    opts?: { for?: "me" | "everyone"; hard?: boolean }
  ) {
    const res = await api.delete(`${apiBase}/api/messages/${message_id}`, {
      params: { for: opts?.for ?? "me", hard: !!opts?.hard },
    });
    return res.data;
  },
};




{ 
/*

// store/api/messagesApi.ts
import axios, { AxiosInstance } from "axios";

export type UUID = string;

export type Conversation = {
  id: UUID;
  user_id: UUID | null;
  admin_id: UUID | null;
  peer_display_name: string;
  unread_count: number;
  last_message_at: string | null; // ISO
  created_at: string;             // ISO
  user_profile_image_url?: string | null;
  admin_profile_image_url?: string | null;
};

export type Message = {
  id: UUID;
  conversation_id: UUID;
  sender_role: "user" | "admin";
  body: string;
  created_at: string;          // ISO
  read_by_user_at?: string | null;
  read_by_admin_at?: string | null;
};

export type SendResponse = {
  message: Message;
  auto_reply?: Message | null;
  conversation: Conversation;
  mood?: { label?: string | null; score?: number | null } | null;
};

const apiBase =
  (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000").replace(/\/+$/, "");

const api: AxiosInstance = axios.create({
  baseURL: `${apiBase}/api/messages`,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

// 🔐 attach token

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("authToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


// 🚨 token expiry -> bounce to /login
api.interceptors.response.use(
  (r) => r,
  (err) => {
    const status = err.response?.status;
    const msg = String(err.response?.data?.error || err.response?.data?.message || "");
    if (status === 401 || /token expired/i.test(msg)) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
        alert("Your session expired. Please log in again.");
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export const messagesApi = {
  // Conversations
  async listConversations(params?: { limit?: number; offset?: number }): Promise<Conversation[]> {
    const res = await api.get<Conversation[]>("/conversations", { params });
    return res.data;
  },
  async createOrFetchConversation(payload: { admin_id?: UUID; user_id?: UUID }): Promise<Conversation> {
    const res = await api.post<Conversation>("/conversations", payload);
    return res.data;
  },
  async hideConversation(conversation_id: UUID, mode: "me" | "everyone" = "me") {
    const res = await api.delete<{ ok: true }>(`/conversations/${conversation_id}`, {
      params: { for: mode },
    });
    return res.data;
  },

  // Messages
  async listMessages(conversation_id: UUID, params?: { limit?: number; before?: string }) {
    const res = await api.get<Message[]>(`/conversations/${conversation_id}/messages`, { params });
    return res.data;
  },
  async markRead(conversation_id: UUID) {
    const res = await api.post<{ ok: true; read_at: string }>(`/conversations/${conversation_id}/read`, {});
    return res.data;
  },
  async send(payload: { body: string; conversation_id?: UUID; admin_id?: UUID; user_id?: UUID }) {
    const res = await api.post<SendResponse>("/send", payload);
    return res.data;
  },
  async deleteMessage(message_id: UUID, opts?: { for?: "me" | "everyone"; hard?: boolean }) {
    const res = await api.delete(`/`, {
      // easier to keep URL clean:
      url: `${apiBase}/api/messages/${message_id}`,
      params: { for: opts?.for ?? "me", hard: !!opts?.hard },
    });
    return res.data;
  },
};




*/}
