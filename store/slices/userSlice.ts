// store/slices/userSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { userApi } from "../api/userApi";

// ----------------------------------------------------
// 🧩 User Profile Type
// ----------------------------------------------------
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

// ----------------------------------------------------
// 🧩 Redux State Definition
// ----------------------------------------------------
interface UserState {
  token: string | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

// ----------------------------------------------------
// 🧩 Initial State (Safe for SSR)
// ----------------------------------------------------
const initialState: UserState = {
  token:
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null,
  profile: null,
  loading: false,
  error: null,
};

// ----------------------------------------------------
// ✅ Async Thunks
// ----------------------------------------------------

// 1️⃣ Fetch current user's profile
export const fetchUserProfile = createAsyncThunk(
  "user/fetchProfile",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      // Wait for token to exist before fetching
      const token =
        typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

      if (!token) {
        console.warn("⚠️ No token found before fetchUserProfile()");
        throw new Error("Missing token");
      }

      const data = await userApi.fetchProfile();
      return data;
    } catch (err: unknown) {
      let message = "Failed to fetch user profile";
      if (typeof err === "object" && err !== null) {
        const e = err as { response?: { data?: { error?: string; message?: string } }; message?: string };
        message =
          e.response?.data?.error ||
          e.response?.data?.message ||
          e.message ||
          message;
      } else if (typeof err === "string") {
        message = err;
      }

      if (
        message.toLowerCase().includes("token") &&
        message.toLowerCase().includes("expired")
      ) {
        dispatch(clearUser());
      }

      return rejectWithValue(message);
    }
  }
);


// 2️⃣ Logout thunk (frontend only)
export const logoutUser = createAsyncThunk("user/logout", async () => {
  await userApi.logout(); // frontend cleanup only
  return true;
});

// ----------------------------------------------------
// ✅ Slice Definition
// ----------------------------------------------------
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // Set token manually (e.g., after OAuth or Face login)
    setToken: (state, action) => {
      state.token = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("authToken", action.payload);
      }
    },

    // Clear user completely (used by logout or token expiration)
    clearUser: (state) => {
      state.token = null;
      state.profile = null;
      state.error = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
      }
    },
  },

  extraReducers: (builder) => {
    builder
      // Fetch profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.error = null;
        console.log("✅ Redux store updated with profile:", action.payload);
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Logout → reset all state
      .addCase(logoutUser.fulfilled, (state) => {
        state.token = null;
        state.profile = null;
        state.error = null;
        if (typeof window !== "undefined") {
          localStorage.removeItem("authToken");
        }
      });
  },
});

// ----------------------------------------------------
// ✅ Exports
// ----------------------------------------------------
export const { setToken, clearUser } = userSlice.actions;
export default userSlice.reducer;
