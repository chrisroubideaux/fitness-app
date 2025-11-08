// store/api/axiosClient.ts
import axios, { AxiosInstance } from "axios";

/**
 * 🔹 Shared Axios instance for all API requests (User + Admin)
 * Automatically attaches the correct token from localStorage.
 */
const axiosClient: AxiosInstance = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Attach the appropriate token (user or admin)
axiosClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const userToken = localStorage.getItem("token");
    const adminToken = localStorage.getItem("adminToken");

    // Give priority to admin if both exist (for admin routes)
    const token = adminToken || userToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ✅ Optionally log or handle global errors
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("❌ API error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axiosClient;



{/*
import axios from "axios";

// Base axios instance for your Flask backend
export const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: false,
});

// Optional: attach token if present
api.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
*/}