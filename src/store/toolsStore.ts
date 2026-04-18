import { toolsAPI } from "@/services/api";
import { create } from "zustand";

interface CacheKeyInfo {
  name: string;
  ttl: number | null;
  size?: number;
}

interface HealthStatus {
  mongodb: {
    status: "healthy" | "unhealthy";
    responseTime?: number;
    error?: string;
  };
  redis: { status: "healthy" | "unhealthy"; error?: string };
  cloudinary: { status: "healthy" | "unhealthy"; error?: string };
  checkedAt: Date;
}

interface ToolsStore {
  // Cache
  cacheKeys: CacheKeyInfo[];
  cacheLoading: boolean;
  cacheStats: { totalKeys: number; dbSize: number } | null;
  fetchCacheKeys: () => Promise<void>;
  deleteCacheKey: (key: string) => Promise<void>;
  clearAllCache: () => Promise<void>;

  // Health
  health: HealthStatus | null;
  healthLoading: boolean;
  healthError: string | null;
  checkHealth: () => Promise<void>;

  // Exports
  exporting: { [key: string]: boolean };
  downloadFile: (data: Blob, filename: string) => void;

  // Maintenance
  executing: { [key: string]: boolean };
  lastResult: { [key: string]: number } | null;
  executeMaintenanceAction: (
    action: "carts" | "coupons" | "notifications",
  ) => Promise<void>;
}

export const useToolsStore = create<ToolsStore>((set, get) => ({
  // Cache
  cacheKeys: [],
  cacheLoading: false,
  cacheStats: null,

  fetchCacheKeys: async () => {
    set({ cacheLoading: true });
    try {
      const response = await toolsAPI.getCacheKeys();
      set({ cacheKeys: response.keys, cacheStats: response.stats });
    } catch (error) {
      console.error("Failed to fetch cache keys:", error);
    } finally {
      set({ cacheLoading: false });
    }
  },

  deleteCacheKey: async (key: string) => {
    try {
      await toolsAPI.clearCacheKey(key);
      // Refetch keys
      get().fetchCacheKeys();
    } catch (error) {
      console.error("Failed to delete cache key:", error);
      throw error;
    }
  },

  clearAllCache: async () => {
    try {
      await toolsAPI.clearAllCache();
      get().fetchCacheKeys();
    } catch (error) {
      console.error("Failed to clear all cache:", error);
      throw error;
    }
  },

  // Health
  health: null,
  healthLoading: false,
  healthError: null,

  checkHealth: async () => {
    set({ healthLoading: true, healthError: null });
    try {
      const health = await toolsAPI.checkHealth();
      set({ health });
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Health check failed";
      set({ healthError: errorMsg });
    } finally {
      set({ healthLoading: false });
    }
  },

  // Exports
  exporting: {},

  downloadFile: (data: Blob, filename: string) => {
    const url = window.URL.createObjectURL(data);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Maintenance
  executing: {},
  lastResult: null,

  executeMaintenanceAction: async (
    action: "carts" | "coupons" | "notifications",
  ) => {
    set((state) => ({
      executing: { ...state.executing, [action]: true },
    }));

    try {
      let result;
      if (action === "carts") {
        result = await toolsAPI.clearGuestCarts();
      } else if (action === "coupons") {
        result = await toolsAPI.expireOldCoupons();
      } else if (action === "notifications") {
        result = await toolsAPI.flushOldNotifications();
      }

      set((state) => ({
        lastResult: {
          ...state.lastResult,
          [action]:
            result?.clearedCount ||
            result?.expiredCount ||
            result?.flushedCount ||
            0,
        },
      }));
    } catch (error) {
      console.error(`Failed to execute ${action}:`, error);
      throw error;
    } finally {
      set((state) => ({
        executing: { ...state.executing, [action]: false },
      }));
    }
  },
}));
