// store/slices/userSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { userApi } from "../api/userApi";

// 🔹 User Profile type
export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  bio?: string | null;
  address?: string | null;
  phone_number?: string | null;
  profile_image_url?: string | null;
  membership_plan_id?: string | null;
  plan_name?: string | null;
  plan_price?: number | null;
  plan_features?: string[] | null;
}

// 🔹 Redux State
interface UserState {
  token: string | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

// 🔹 Initialize state safely for SSR
const initialState: UserState = {
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
  profile: null,
  loading: false,
  error: null,
};

// ----------------------------------------------------
// ✅ Async Thunks
// ----------------------------------------------------

// Fetch profile (protected route)
export const fetchUserProfile = createAsyncThunk(
  "user/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const data = await userApi.fetchProfile();
      return data;
    } catch (err: any) {
      console.error("❌ fetchUserProfile error:", err);
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch user profile";
      return rejectWithValue(message);
    }
  }
);

// ----------------------------------------------------
// ✅ Slice Definition
// ----------------------------------------------------
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("token", action.payload);
      }
    },
    clearUser: (state) => {
      state.token = null;
      state.profile = null;
      state.error = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null; // clear old errors
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.error = null; // ✅ clear any "Failed to fetch" leftovers
        console.log("✅ Redux store updated with profile:", action.payload);
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setToken, clearUser } = userSlice.actions;
export default userSlice.reducer;



{/*
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { userApi } from "../api/userApi";

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  bio?: string | null;
  address?: string | null;
  phone_number?: string | null;
  profile_image_url?: string | null;
  membership_plan_id?: string | null;
  plan_name?: string | null;
  plan_price?: number | null;
  plan_features?: string[] | null;
}

interface UserState {
  token: string | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
  profile: null,
  loading: false,
  error: null,
};

// ✅ Fetch user profile (protected)
export const fetchUserProfile = createAsyncThunk(
  "user/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const data = await userApi.fetchProfile();
      return data;
    } catch (err: any) {
      console.error("❌ fetchUserProfile error:", err);
      return rejectWithValue("Failed to fetch user profile");
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("token", action.payload);
      }
    },
    clearUser: (state) => {
      state.token = null;
      state.profile = null;
      state.error = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        console.log("✅ Redux store updated with profile:", action.payload);
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setToken, clearUser } = userSlice.actions;
export default userSlice.reducer;

*/}