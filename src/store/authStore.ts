import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AdminUser, AdminRole, ROLE_PERMISSIONS } from "@/types/admin";

interface AuthState {
  admin: AdminUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  role: AdminRole | null;
  permissions: string[];
  setAuth: (admin: AdminUser, tokens: { accessToken: string; refreshToken: string }) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: AdminRole) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      admin: null,
      accessToken: null,
      refreshToken: null,
      role: null,
      permissions: [],
      setAuth: (admin, tokens) =>
        set({
          admin,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          role: admin.role,
          permissions: ROLE_PERMISSIONS[admin.role] || [],
        }),
      logout: () =>
        set({
          admin: null,
          accessToken: null,
          refreshToken: null,
          role: null,
          permissions: [],
        }),
      hasPermission: (permission) => get().permissions.includes(permission),
      hasRole: (role) => get().role === role,
    }),
    { name: "admin-auth" }
  )
);
