import axios from "axios";
import { useAuthStore } from "../store/authStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ============================================
// Buyer API Functions
// ============================================

export const buyerApi = {
  // Create buyer
  createBuyer: (data: any) => api.post("/api/buyers", data),

  // Get all buyers with pagination and filters
  getBuyers: (page: number = 1, limit: number = 10, filters?: any) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.name && { name: filters.name }),
      ...(filters?.email && { email: filters.email }),
    });
    return api.get(`/api/buyers?${params.toString()}`);
  },

  // Get buyer by ID
  getBuyerById: (id: string) => api.get(`/api/buyers/${id}`),

  // Update buyer
  updateBuyer: (id: string, data: any) => api.put(`/api/buyers/${id}`, data),

  // Delete buyer
  deleteBuyer: (id: string) => api.delete(`/api/buyers/${id}`),

  // Get active buyers (for dropdown)
  getActiveBuyers: () => api.get("/api/buyers/active"),
};

// ============================================
// Sample Request API Functions
// ============================================

export const sampleRequestApi = {
  // Update item status
  updateItemStatus: (requestId: string, itemId: string, status: string) =>
    api.patch(`/api/sample-requests/${requestId}/items/${itemId}/status`, {
      status,
    }),
};

export default api;
