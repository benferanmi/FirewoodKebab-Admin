import client from "./client";
import { API_ENDPOINTS } from "@/config/api";
import { AdminUser, AdminRole } from "@/types/admin";

export interface CreateTeamMemberRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: AdminRole;
  permissions?: string[];
}

export interface UpdateTeamMemberRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: AdminRole;
  permissions?: string[];
  isActive?: boolean;
}

export interface ActivityLog {
  id: string;
  adminId: string;
  action: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

export const teamAPI = {
  getTeamMembers: (params?: { page?: number; limit?: number }) =>
    client.get(API_ENDPOINTS.TEAM, { params }).then((r) => r.data.data as { admins: AdminUser[]; pagination?: any }),

  createTeamMember: (data: CreateTeamMemberRequest) =>
    client.post(API_ENDPOINTS.TEAM, data).then((r) => r.data.data as AdminUser),

  updateTeamMember: (id: string, data: UpdateTeamMemberRequest) =>
    client.put(API_ENDPOINTS.TEAM_MEMBER(id), data).then((r) => r.data.data as AdminUser),

  deleteTeamMember: (id: string) =>
    client.delete(API_ENDPOINTS.TEAM_MEMBER(id)).then((r) => r.data),

  getActivityLog: (params?: { adminId?: string; page?: number; limit?: number }) =>
    client.get(API_ENDPOINTS.TEAM_ACTIVITY, { params }).then((r) => r.data as { data: ActivityLog[]; pagination?: any }),
};
