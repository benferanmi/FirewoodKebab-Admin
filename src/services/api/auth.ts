import { Permission } from "@/types/admin";
import client from "./client";
import { API_ENDPOINTS } from "@/config/api";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    admin: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      role: string;
      isActive: boolean;
      lastLogin?: string;
      createdAt: string;
      updatedAt: string;
      permissions: Permission[];
    };
    accessToken: string;
    refreshToken: string;
  };
}

export const authAPI = {
  login: (data: LoginRequest) =>
    client
      .post<LoginResponse>(API_ENDPOINTS.AUTH_LOGIN, data)
      .then((r) => r.data),

  logout: () => client.post(API_ENDPOINTS.AUTH_LOGOUT).then((r) => r.data),

  refreshToken: (refreshToken: string) =>
    client
      .post(API_ENDPOINTS.AUTH_REFRESH, { refreshToken })
      .then((r) => r.data),
};
