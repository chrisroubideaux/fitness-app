// store/slices/messagesSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { messagesApi, type Conversation, type Message, type SendResponse, type UUID } from "../api/messagesApi";

type MessagesState = {
  conversations: Conversation[];
  messagesByConv: Record<UUID, Message[]>;
  activeConversationId: UUID | null;

  loadingConvos: boolean;
  loadingMessages: boolean;
  sending: boolean;
  error: string | null;
};

const initialState: MessagesState = {
  conversations: [],
  messagesByConv: {},
  activeConversationId: null,

  loadingConvos: false,
  loadingMessages: false,
  sending: false,
  error: null,
};

// ---------------- Thunks ----------------
export const fetchConversations = createAsyncThunk<Conversation[], { limit?: number; offset?: number } | void, { rejectValue: string }>(
  "messages/fetchConversations",
  async (args, { rejectWithValue }) => {
    try {
      return await messagesApi.listConversations(args ?? {});
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.error || e?.message || "Failed to load conversations");
    }
  }
);

export const openOrCreateConversation = createAsyncThunk<Conversation, { admin_id?: UUID; user_id?: UUID }, { rejectValue: string }>(
  "messages/openOrCreateConversation",
  async (payload, { rejectWithValue }) => {
    try {
      return await messagesApi.createOrFetchConversation(payload);
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.error || e?.message || "Failed to open conversation");
    }
  }
);

export const fetchMessages = createAsyncThunk<{ conversation_id: UUID; items: Message[] }, { conversation_id: UUID; limit?: number; before?: string }, { rejectValue: string }>(
  "messages/fetchMessages",
  async ({ conversation_id, limit, before }, { rejectWithValue }) => {
    try {
      const items = await messagesApi.listMessages(conversation_id, { limit, before });
      return { conversation_id, items };
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.error || e?.message || "Failed to load messages");
    }
  }
);

export const markConversationRead = createAsyncThunk<{ conversation_id: UUID }, { conversation_id: UUID }, { rejectValue: string }>(
  "messages/markRead",
  async ({ conversation_id }, { rejectWithValue }) => {
    try {
      await messagesApi.markRead(conversation_id);
      return { conversation_id };
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.error || e?.message || "Failed to mark read");
    }
  }
);

export const sendMessageThunk = createAsyncThunk<{ conversation: Conversation; sent: Message; auto?: Message | null }, { body: string; conversation_id?: UUID; admin_id?: UUID; user_id?: UUID }, { rejectValue: string }>(
  "messages/send",
  async (payload, { rejectWithValue }) => {
    try {
      const data: SendResponse = await messagesApi.send(payload);
      return { conversation: data.conversation, sent: data.message, auto: data.auto_reply ?? null };
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.error || e?.message || "Failed to send message");
    }
  }
);

// ---------------- Slice ----------------
const slice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    setActiveConversation(state, action: PayloadAction<UUID | null>) {
      state.activeConversationId = action.payload;
    },
    prependHistory(state, action: PayloadAction<{ conversation_id: UUID; items: Message[] }>) {
      const { conversation_id, items } = action.payload;
      const current = state.messagesByConv[conversation_id] ?? [];
      state.messagesByConv[conversation_id] = [...items, ...current];
    },
    clearMessagesState() {
      return initialState;
    },
  },
  extraReducers: (b) => {
    // Conversations
    b.addCase(fetchConversations.pending, (s) => {
      s.loadingConvos = true;
      s.error = null;
    });
    b.addCase(fetchConversations.fulfilled, (s, a) => {
      s.loadingConvos = false;
      s.conversations = a.payload;
    });
    b.addCase(fetchConversations.rejected, (s, a) => {
      s.loadingConvos = false;
      s.error = a.payload || "Failed to load conversations";
    });

    b.addCase(openOrCreateConversation.fulfilled, (s, a) => {
      const c = a.payload;
      const exists = s.conversations.find((x) => x.id === c.id);
      if (!exists) s.conversations.unshift(c);
      else Object.assign(exists, c);
      s.activeConversationId = c.id;
      if (!s.messagesByConv[c.id]) s.messagesByConv[c.id] = [];
    });

    // Messages
    b.addCase(fetchMessages.pending, (s) => {
      s.loadingMessages = true;
      s.error = null;
    });
    b.addCase(fetchMessages.fulfilled, (s, a) => {
      s.loadingMessages = false;
      const { conversation_id, items } = a.payload;
      s.messagesByConv[conversation_id] = items; // newest at end (API already chronological asc)
    });
    b.addCase(fetchMessages.rejected, (s, a) => {
      s.loadingMessages = false;
      s.error = a.payload || "Failed to load messages";
    });

    // Mark read -> zero out unread count locally
    b.addCase(markConversationRead.fulfilled, (s, a) => {
      const { conversation_id } = a.payload;
      const conv = s.conversations.find((c) => c.id === conversation_id);
      if (conv) conv.unread_count = 0;
    });

    // Send
    b.addCase(sendMessageThunk.pending, (s) => {
      s.sending = true;
      s.error = null;
    });
    b.addCase(sendMessageThunk.fulfilled, (s, a) => {
      s.sending = false;
      const { conversation, sent, auto } = a.payload;

      // upsert conversation + set active
      const idx = s.conversations.findIndex((c) => c.id === conversation.id);
      if (idx >= 0) s.conversations[idx] = conversation;
      else s.conversations.unshift(conversation);
      s.activeConversationId = conversation.id;

      // append messages
      const arr = s.messagesByConv[conversation.id] ?? [];
      arr.push(sent);
      if (auto) arr.push(auto);
      s.messagesByConv[conversation.id] = arr;
    });
    b.addCase(sendMessageThunk.rejected, (s, a) => {
      s.sending = false;
      s.error = a.payload || "Failed to send message";
    });
  },
});

export const { setActiveConversation, prependHistory, clearMessagesState } = slice.actions;
export default slice.reducer;
