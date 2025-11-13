// store/api/axiosClient.ts
// store/api/axiosClient.ts
import axios, { AxiosInstance } from "axios";

/**
 * 🔹 Shared Axios instance for all API requests (User + Admin)
 * Automatically attaches the correct token and handles 401s.
 */
const axiosClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api",
  withCredentials: false,
  headers: { "Content-Type": "application/json" },
});

// ✅ Attach the appropriate token (admin > user)
axiosClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const adminToken =
      localStorage.getItem("adminToken") || localStorage.getItem("admin_token");
    const userToken =
      localStorage.getItem("authToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("userToken");

    const token = adminToken || userToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🚨 Global error handling: redirect by role on 401
axiosClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const msg = String(err.response?.data?.error || err.response?.data?.message || "");

    if (status === 401 || /token expired/i.test(msg)) {
      if (typeof window !== "undefined") {
        const isAdmin = !!localStorage.getItem("adminToken");
        if (isAdmin) {
          console.warn("⚠️ Admin session expired");
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminId");
          window.location.href = "/admin/login"; // ✅ correct redirect
        } else {
          console.warn("⚠️ User session expired");
          localStorage.removeItem("authToken");
          localStorage.removeItem("userId");
          window.location.href = "/login";
        }
      }
    }

    console.error("❌ API error:", err.response?.data || err.message);
    return Promise.reject(err);
  }
);

export default axiosClient;



{/*

// store/api/axiosClient.ts
import axios, { AxiosInstance } from "axios";

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

*/}