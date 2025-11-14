// store/api/adminApi.ts

import type { AxiosResponse } from "axios";
import type { AdminProfile } from "../slices/adminSlice";
import axiosClient from "./axiosClient";

/** Basic user shape when a specific type is not available */
export type UserDTO = Record<string, unknown>;

/**
 * Admin API — uses the shared axiosClient (with token auto-injection)
 */
export const adminApi = {
  /** 🧠 Login admin (email + password) */
  async login(
    email: string,
    password: string
  ): Promise<{ token: string; admin_id: string }> {
    const res: AxiosResponse<{ token: string; admin_id: string }> =
      await axiosClient.post("/admins/login", { email, password });
    return res.data;
  },

  /** 👤 Fetch current admin profile (requires Authorization header) */
  async fetchProfile(): Promise<AdminProfile> {
    const res: AxiosResponse<AdminProfile> = await axiosClient.get("/admins/me");
    return res.data;
  },

  /** ✏️ Update admin profile */
  async updateProfile(formData: Partial<AdminProfile>): Promise<AdminProfile> {
    const adminId = localStorage.getItem("adminId");
    if (!adminId) throw new Error("Admin ID missing");

    const res: AxiosResponse<AdminProfile> = await axiosClient.put(
      `/admins/${adminId}`,
      formData
    );
    return res.data;
  },

  /** 🚪 Logout admin */
  async logout(): Promise<{ message: string }> {
    const res: AxiosResponse<{ message: string }> = await axiosClient.post(
      "/admins/logout"
    );
    return res.data;
  },

  /** 🖼 Upload admin avatar */
  async uploadProfileImage(imageFile: File): Promise<{ url: string }> {
    const fd = new FormData();
    fd.append("image", imageFile);

    const res: AxiosResponse<{ url: string }> = await axiosClient.post(
      "/admins/upload-profile",
      fd,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data;
  },

  /** 🖼 Upload admin banner */
  async uploadBannerImage(imageFile: File): Promise<{ url: string }> {
    const fd = new FormData();
    fd.append("image", imageFile);

    const res: AxiosResponse<{ url: string }> = await axiosClient.post(
      "/admins/upload-banner",
      fd,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data;
  },

  /** 👥 Fetch all admins (requires token) */
  async fetchAllAdmins(): Promise<AdminProfile[]> {
    const res: AxiosResponse<AdminProfile[]> = await axiosClient.get("/admins");
    return res.data;
  },

  /** 🧍‍♂️ Fetch all users (for admin dashboard) */
  async fetchAllUsers(): Promise<UserDTO[]> {
    const res: AxiosResponse<UserDTO[]> = await axiosClient.get("/admins/users");
    return res.data;
  },

  /** ❌ Delete a user */
  async deleteUser(userId: string): Promise<{ message: string }> {
    const res: AxiosResponse<{ message: string }> = await axiosClient.delete(
      `/admins/delete_user/${userId}`
    );
    return res.data;
  },
};
