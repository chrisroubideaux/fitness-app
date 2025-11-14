// store/slices/appointmentsSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { appointmentsApi, type CalendarEvent } from "../api/appointmentsApi";

interface AppointmentsState {
  list: CalendarEvent[];
  loading: boolean;
  error: string | null;
}

const initialState: AppointmentsState = {
  list: [],
  loading: false,
  error: null,
};

// ----------------------------------------------------
// ✅ Async Thunks
// ----------------------------------------------------
export const fetchAppointments = createAsyncThunk<
  CalendarEvent[],
  void,
  { rejectValue: string }
>("appointments/fetchMyEvents", async (_, { rejectWithValue }) => {
  try {
    return await appointmentsApi.fetchMyEvents();
  } catch (err: unknown) {
    let msg = "Failed to load events";
    if (err && typeof err === "object") {
      const e = err as {
        message?: string;
        response?: { data?: { error?: string; message?: string } };
      };
      msg =
        e.response?.data?.error ||
        e.response?.data?.message ||
        e.message ||
        msg;
    }
    return rejectWithValue(msg);
  }
});

export const bookAppointment = createAsyncThunk<
  CalendarEvent,
  CalendarEvent,
  { rejectValue: string }
>("appointments/bookAppointment", async (event, { rejectWithValue }) => {
  try {
    // Replace with an API call if available, e.g., return await appointmentsApi.bookAppointment(event)
    return event;
  } catch (err: unknown) {
    let msg = "Failed to book event";
    if (err && typeof err === "object") {
      const e = err as {
        message?: string;
        response?: { data?: { error?: string; message?: string } };
      };
      msg =
        e.response?.data?.error ||
        e.response?.data?.message ||
        e.message ||
        msg;
    }
    return rejectWithValue(msg);
  }
});


// ----------------------------------------------------
// ✅ Slice Definition
// ----------------------------------------------------
const appointmentsSlice = createSlice({
  name: "appointments",
  initialState,
  reducers: {
    clearAppointments: (state) => {
      state.list = [];
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch events
      .addCase(fetchAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch events";
      })

      // Book event
      .addCase(bookAppointment.fulfilled, (state, action) => {
        state.list.push(action.payload);
      });
  },
});

export const { clearAppointments } = appointmentsSlice.actions;
export default appointmentsSlice.reducer;
