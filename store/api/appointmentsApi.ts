// store/api/appointmentsApi.ts
import axios, { AxiosInstance } from "axios";

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  event_type: string;
  status: string;
  user_id?: string | null;
  admin_id?: string | null;
  guest_name?: string | null;
  guest_email?: string | null;
  guest_phone?: string | null;
  start_time: string;
  start_time_display?: string;
  end_time: string;
  end_time_display?: string;
  created_at?: string;
  created_at_display?: string;
}

// ----------------------------------------------------
// 🔧 Axios instance for /api/appointments endpoints
// ----------------------------------------------------
const api: AxiosInstance = axios.create({
  baseURL: "http://localhost:5000/api/appointments",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// 🔐 Attach Bearer token from Redux/localStorage
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("authToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🚨 Handle token expiration gracefully
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const msg = err.response?.data?.error || err.response?.data?.message || "";
    if (status === 401 || msg.toLowerCase().includes("token expired")) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
        alert("Your session expired. Please log in again.");
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

// ----------------------------------------------------
// 🧩 API methods matching backend routes
// ----------------------------------------------------
export const appointmentsApi = {
  async fetchMyEvents(): Promise<CalendarEvent[]> {
    const res = await api.get<CalendarEvent[]>("/my-events");
    return Array.isArray(res.data) ? res.data : [];
  },

  async bookEvent(payload: {
    title: string;
    event_type: string;
    start_time: string;
    end_time: string;
    description?: string;
    admin_id?: string;
  }): Promise<{ message: string; event: CalendarEvent }> {
    const res = await api.post<{ message: string; event: CalendarEvent }>("/book", payload);
    return res.data;
  },

  async updateEvent(eventId: string, payload: Partial<CalendarEvent>) {
    const res = await api.put<{ message: string; event: CalendarEvent }>(
      `/update/${eventId}`,
      payload
    );
    return res.data;
  },

  async deleteEvent(eventId: string) {
    const res = await api.delete<{ message: string; event_id: string }>(
      `/delete/${eventId}`
    );
    return res.data;
  },
};

export default appointmentsApi;
