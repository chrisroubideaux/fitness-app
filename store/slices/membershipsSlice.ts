// store/slices/membershipsSlice.ts

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { membershipsApi, type MembershipPlan } from "../api/membershipsApi";

interface MembershipsState {
  list: MembershipPlan[];
  loading: boolean;
  error: string | null;
}

const initialState: MembershipsState = {
  list: [],
  loading: false,
  error: null,
};

// ✅ Fetch all plans
export const fetchMemberships = createAsyncThunk<
  MembershipPlan[],
  void,
  { rejectValue: string }
>("memberships/fetchAll", async (_, { rejectWithValue }) => {
  try {
    return await membershipsApi.fetchAllPlans();
  } catch {
    return rejectWithValue("Failed to load memberships");
  }
});

// ✅ Create new plan
export const createMembership = createAsyncThunk<
  MembershipPlan,
  Omit<MembershipPlan, "id">,
  { rejectValue: string }
>("memberships/create", async (payload, { rejectWithValue }) => {
  try {
    return await membershipsApi.createPlan(payload);
  } catch {
    return rejectWithValue("Failed to create plan");
  }
});

// ✅ Update existing plan
export const updateMembership = createAsyncThunk<
  MembershipPlan,
  { id: string; payload: Partial<MembershipPlan> },
  { rejectValue: string }
>("memberships/update", async ({ id, payload }, { rejectWithValue }) => {
  try {
    return await membershipsApi.updatePlan(id, payload);
  } catch {
    return rejectWithValue("Failed to update plan");
  }
});

// ✅ Delete plan
export const deleteMembership = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("memberships/delete", async (id, { rejectWithValue }) => {
  try {
    await membershipsApi.deletePlan(id);
    return id;
  } catch {
    return rejectWithValue("Failed to delete plan");
  }
});

const membershipsSlice = createSlice({
  name: "memberships",
  initialState,
  reducers: {
    clearMemberships: (state) => {
      state.list = [];
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchMemberships.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchMemberships.fulfilled, (s, a) => {
        s.loading = false;
        s.list = a.payload;
      })
      .addCase(fetchMemberships.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload || "Failed to fetch memberships";
      })

      // Create
      .addCase(createMembership.fulfilled, (s, a) => {
        s.list.push(a.payload);
      })

      // Update
      .addCase(updateMembership.fulfilled, (s, a) => {
        const idx = s.list.findIndex((p) => p.id === a.payload.id);
        if (idx !== -1) s.list[idx] = a.payload;
      })

      // Delete
      .addCase(deleteMembership.fulfilled, (s, a) => {
        s.list = s.list.filter((p) => p.id !== a.payload);
      });
  },
});

export const { clearMemberships } = membershipsSlice.actions;
export default membershipsSlice.reducer;
