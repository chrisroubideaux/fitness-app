// store/api/userApi.ts

import axios, { AxiosInstance } from "axios";
import type { UserProfile } from "../slices/userSlice";

const api: AxiosInstance = axios.create({
  baseURL: "http://localhost:5000/api/users",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ----------------------------------------------------
// 🔐 Request Interceptor → Attach Bearer token only when valid
// ----------------------------------------------------
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("authToken");

    if (token && token !== "undefined" && token !== "null") {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("🔐 Attached token:", token.slice(0, 25) + "...");
    } else {
      console.warn("⚠️ No valid token when calling:", config.url);
    }
  }
  return config;
});

// ----------------------------------------------------
// 🚨 Response Interceptor → Handle Expired Tokens
// ----------------------------------------------------
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const message =
      err.response?.data?.message || err.response?.data?.error || "";

    if (status === 401 || message.toLowerCase().includes("token expired")) {
      console.warn("⚠️ Token expired — clearing session and redirecting...");

      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
        alert("Your session expired. Please log in again.");
        window.location.href = "/login";
      }
    }

    console.error(
      "❌ userApi error:",
      status,
      err.response?.data || err.message
    );
    return Promise.reject(err);
  }
);

// ----------------------------------------------------
// 🧠 USER API METHODS
// ----------------------------------------------------
export const userApi = {
  async register(full_name: string, email: string, password: string) {
    const res = await api.post<{ message: string; user_id: string }>("/register", {
      full_name,
      email,
      password,
    });
    return res.data;
  },

  async login(email: string, password: string) {
    const res = await api.post<{ message: string; token: string; user_id: string }>(
      "/login",
      { email, password }
    );
    console.log("✅ login success:", res.data);

    // ✅ Immediately persist to localStorage to avoid race condition
    if (typeof window !== "undefined" && res.data.token) {
      localStorage.setItem("authToken", res.data.token);
    }

    return res.data;
  },

  async fetchProfile(): Promise<UserProfile> {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

    if (!token) {
      throw new Error("Missing token before fetchProfile()");
    }

    const headers = { Authorization: `Bearer ${token}` };
    const res = await api.get<UserProfile>("/me", { headers });
    console.log("✅ fetchProfile success:", res.data);
    return res.data;
  },

  async updateProfile(userId: string, formData: Partial<UserProfile>) {
    const res = await api.put<UserProfile>(`/${userId}`, formData);
    console.log("✅ updateProfile success:", res.data);
    return res.data;
  },

  async uploadProfileImage(imageFile: File) {
    const fd = new FormData();
    fd.append("image", imageFile);
    const res = await api.post<{ message: string; url: string }>(
      "/upload-profile",
      fd,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    console.log("✅ uploadProfileImage success:", res.data);
    return res.data;
  },

  async logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      console.log("🚪 User logged out");
    }
    return true;
  },

  async fetchAdminsForUsers() {
    const res = await api.get<
      { id: string; full_name: string; email: string; profile_image_url?: string }[]
    >("/admins");
    console.log("✅ fetchAdminsForUsers success:", res.data.length, "admins");
    return res.data;
  },
};

export default api;
