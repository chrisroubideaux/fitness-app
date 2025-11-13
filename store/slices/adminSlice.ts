// store/slices/adminSlice.ts
// store/slices/adminSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { adminApi } from "../api/adminApi";

// ✅ Define AdminProfile interface directly here
export interface AdminProfile {
  id: string;
  full_name: string;
  email: string;
  bio?: string | null;
  address?: string | null;
  phone_number?: string | null;
  profile_image_url?: string | null;
  profile_banner_url?: string | null;

  // Trainer data
  age?: number | null;
  weight?: number | null;
  height?: number | null;
  gender?: string | null;
  fitness_goal?: string | null;
  activity_level?: string | null;
  experience_level?: string | null;
  experience_years?: number | null;
  certifications?: string | null;
  specialties?: string | null;
  medical_conditions?: string | null;

  // Schedule
  days?: string | null;
  times?: string | null;
  group?: string | null;
  virtual_session?: boolean | null;

  // Membership + role
  membership_plan_id?: string | null;
  role?: string | null;

  // Socials
  facebook?: string | null;
  instagram?: string | null;
  youtube?: string | null;
  tiktok?: string | null;

  is_active?: boolean;
  created_at?: string;
}

// ✅ State type
interface AdminState {
  token: string | null;
  profile: AdminProfile | null;
  loading: boolean;
  error: string | null;
}

// ✅ Utility: safely access localStorage in browser only
const safeGetToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("adminToken");
  }
  return null;
};

const safeSetItem = (key: string, value: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, value);
  }
};

const safeRemoveItem = (key: string) => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(key);
  }
};

// ✅ Initial state
const initialState: AdminState = {
  token: safeGetToken(),
  profile: null,
  loading: false,
  error: null,
};

// ✅ Async thunks
export const loginAdmin = createAsyncThunk<
  { token: string; admin_id: string },
  { email: string; password: string },
  { rejectValue: string }
>("admin/loginAdmin", async (credentials, { rejectWithValue }) => {
  try {
    const data = await adminApi.login(credentials.email, credentials.password);
    safeSetItem("adminToken", data.token);
    safeSetItem("adminId", data.admin_id);
    return data;
  } catch (err: unknown) {
    if (typeof err === "object" && err !== null && "response" in err) {
      const e = err as any;
      return rejectWithValue(e.response?.data?.error || "Admin login failed");
    }
    return rejectWithValue("Admin login failed");
  }
});

export const fetchAdminProfile = createAsyncThunk<
  AdminProfile,
  void,
  { rejectValue: string }
>("admin/fetchProfile", async (_, { rejectWithValue }) => {
  try {
    const data = await adminApi.fetchProfile();
    return data;
  } catch {
    return rejectWithValue("Failed to fetch admin profile");
  }
});

export const updateAdminProfile = createAsyncThunk<
  AdminProfile,
  Partial<AdminProfile>,
  { rejectValue: string }
>("admin/updateProfile", async (formData, { rejectWithValue }) => {
  try {
    const data = await adminApi.updateProfile(formData);
    return data;
  } catch {
    return rejectWithValue("Failed to update admin profile");
  }
});

export const logoutAdmin = createAsyncThunk("admin/logout", async () => {
  await adminApi.logout();
  safeRemoveItem("adminToken");
  safeRemoveItem("adminId");
  return true;
});

// ✅ Slice
const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearAdmin: (state) => {
      state.token = null;
      state.profile = null;
      state.error = null;
      safeRemoveItem("adminToken");
      safeRemoveItem("adminId");
    },
  },
  extraReducers: (builder) => {
    builder
      // 🧠 Login
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        // The profile isn’t returned here; fetchAdminProfile will populate it
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Login failed";
      })

      // 👤 Fetch profile
      .addCase(fetchAdminProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminProfile.fulfilled, (state, action: PayloadAction<AdminProfile>) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchAdminProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch admin profile";
      })

      // ✏️ Update profile
      .addCase(updateAdminProfile.fulfilled, (state, action: PayloadAction<AdminProfile>) => {
        state.profile = { ...state.profile, ...action.payload };
      })

      // 🚪 Logout
      .addCase(logoutAdmin.fulfilled, (state) => {
        state.token = null;
        state.profile = null;
      });
  },
});

export const { clearAdmin } = adminSlice.actions;
export default adminSlice.reducer;




{/*
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { adminApi } from "../api/adminApi";

// ✅ Define AdminProfile interface directly here
export interface AdminProfile {
  id: string;
  full_name: string;
  email: string;
  bio?: string | null;
  address?: string | null;
  phone_number?: string | null;
  profile_image_url?: string | null;
  profile_banner_url?: string | null;

  // Trainer data
  age?: number | null;
  weight?: number | null;
  height?: number | null;
  gender?: string | null;
  fitness_goal?: string | null;
  activity_level?: string | null;
  experience_level?: string | null;
  experience_years?: number | null;
  certifications?: string | null;
  specialties?: string | null;
  medical_conditions?: string | null;

  // Schedule
  days?: string | null;
  times?: string | null;
  group?: string | null;
  virtual_session?: boolean | null;

  // Membership + role
  membership_plan_id?: string | null;
  role?: string | null;

  // Socials
  facebook?: string | null;
  instagram?: string | null;
  youtube?: string | null;
  tiktok?: string | null;

  is_active?: boolean;
  created_at?: string;
}

// ✅ State type
interface AdminState {
  token: string | null;
  profile: AdminProfile | null;
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  token: localStorage.getItem("adminToken") || null,
  profile: null,
  loading: false,
  error: null,
};

// ✅ Async thunks
export const loginAdmin = createAsyncThunk<
  { token: string; admin_id: string },
  { email: string; password: string },
  { rejectValue: string }
>("admin/loginAdmin", async (credentials, { rejectWithValue }) => {
  try {
    const data = await adminApi.login(credentials.email, credentials.password);
    localStorage.setItem("adminToken", data.token);
    localStorage.setItem("adminId", data.admin_id);
    return data;
  } catch (err: unknown) {
    if (typeof err === "object" && err !== null && "response" in err) {
      const e = err as any;
      return rejectWithValue(e.response?.data?.error || "Admin login failed");
    }
    return rejectWithValue("Admin login failed");
  }
});

export const fetchAdminProfile = createAsyncThunk<
  AdminProfile,
  void,
  { rejectValue: string }
>("admin/fetchProfile", async (_, { rejectWithValue }) => {
  try {
    const data = await adminApi.fetchProfile();
    return data;
  } catch {
    return rejectWithValue("Failed to fetch admin profile");
  }
});

export const updateAdminProfile = createAsyncThunk<
  AdminProfile,
  Partial<AdminProfile>,
  { rejectValue: string }
>("admin/updateProfile", async (formData, { rejectWithValue }) => {
  try {
    const data = await adminApi.updateProfile(formData);
    return data;
  } catch {
    return rejectWithValue("Failed to update admin profile");
  }
});

export const logoutAdmin = createAsyncThunk("admin/logout", async () => {
  await adminApi.logout();
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminId");
  return true;
});

// ✅ Slice
const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearAdmin: (state) => {
      state.token = null;
      state.profile = null;
      state.error = null;
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminId");
    },
  },
  extraReducers: (builder) => {
    builder
      // 🧠 Login
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        // The profile isn’t returned here; it’ll be fetched via fetchAdminProfile next
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Login failed";
      })

      // 👤 Fetch profile
      .addCase(fetchAdminProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminProfile.fulfilled, (state, action: PayloadAction<AdminProfile>) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchAdminProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch admin profile";
      })

      // ✏️ Update profile
      .addCase(updateAdminProfile.fulfilled, (state, action: PayloadAction<AdminProfile>) => {
        state.profile = { ...state.profile, ...action.payload };
      })

      // 🚪 Logout
      .addCase(logoutAdmin.fulfilled, (state) => {
        state.token = null;
        state.profile = null;
      });
  },
});

export const { clearAdmin } = adminSlice.actions;
export default adminSlice.reducer;

*/}
