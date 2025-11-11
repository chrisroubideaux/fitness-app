// app/store/api/membershipsApi.ts
// store/api/membershipsApi.ts
import axios, { AxiosInstance } from "axios";

// ----------------------------------------------------
// 🧱 Type definitions
// ----------------------------------------------------
export interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  stripe_price_id?: string | null;
}

// ----------------------------------------------------
// 🔧 Axios instance for /api/memberships endpoints
// ----------------------------------------------------
const api: AxiosInstance = axios.create({
  baseURL: "http://localhost:5000/api/memberships",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ----------------------------------------------------
// 🧩 API methods
// ----------------------------------------------------
export const membershipsApi = {
  // GET all plans
  async fetchAllPlans(): Promise<MembershipPlan[]> {
    const res = await api.get<MembershipPlan[]>("/");
    return Array.isArray(res.data) ? res.data : [];
  },

  // CREATE a new plan
  async createPlan(payload: Omit<MembershipPlan, "id">): Promise<MembershipPlan> {
    const res = await api.post<MembershipPlan>("/", payload);
    return res.data;
  },

  // UPDATE existing plan (PATCH)
  async updatePlan(
    id: string,
    payload: Partial<MembershipPlan>
  ): Promise<MembershipPlan> {
    const res = await api.patch<MembershipPlan>(`/${id}`, payload);
    return res.data;
  },

  // DELETE a plan
  async deletePlan(id: string): Promise<{ message: string }> {
    const res = await api.delete<{ message: string }>(`/${id}`);
    return res.data;
  },
};

export default membershipsApi;

{/*
import axios, { AxiosInstance } from "axios";

// ----------------------------------------------------
// 🧠 Type definitions
// ----------------------------------------------------
export interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
}

// ----------------------------------------------------
// ⚙️ Axios instance for /api/memberships
// ----------------------------------------------------
const api: AxiosInstance = axios.create({
  baseURL: "http://localhost:5000/api/memberships",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ----------------------------------------------------
// 🚀 API Methods
// ----------------------------------------------------
export const membershipsApi = {
  // Fetch all membership plans
  async fetchAllPlans(): Promise<MembershipPlan[]> {
    const res = await api.get<MembershipPlan[]>("/");
    return Array.isArray(res.data) ? res.data : [];
  },

  // (We'll add these later for admin testing)
  async createPlan(payload: Partial<MembershipPlan>): Promise<MembershipPlan> {
    const res = await api.post<MembershipPlan>("/", payload);
    return res.data;
  },

  async updatePlan(planId: string, payload: Partial<MembershipPlan>): Promise<MembershipPlan> {
    const res = await api.patch<MembershipPlan>(`/${planId}`, payload);
    return res.data;
  },

  async deletePlan(planId: string): Promise<{ message: string }> {
    const res = await api.delete<{ message: string }>(`/${planId}`);
    return res.data;
  },
};

export default membershipsApi;

*/}
