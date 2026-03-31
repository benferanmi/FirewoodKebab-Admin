import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "@/config/api";
import { useAuthStore } from "@/store/authStore";

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor: attach access token
client.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Response interceptor: auto-refresh on 401
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { refreshToken } = useAuthStore.getState();
        if (!refreshToken) throw new Error("No refresh token");

        const { data } = await axios.post(
          `${API_BASE_URL}${API_ENDPOINTS.AUTH_REFRESH}`,
          { refreshToken }
        );

        const newTokens = {
          accessToken: data.data?.accessToken || data.accessToken,
          refreshToken: data.data?.refreshToken || data.refreshToken,
        };

        // Update store with new tokens
        const state = useAuthStore.getState();
        if (state.admin) {
          state.setAuth(state.admin, newTokens);
        }

        originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
        return client(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        window.location.href = "/admin/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default client;

// Helper to extract data from API responses
export function extractData<T>(response: { data: { data: T } }): T {
  return response.data.data;
}

export function extractResponse<T>(response: { data: T }): T {
  return response.data;
}
