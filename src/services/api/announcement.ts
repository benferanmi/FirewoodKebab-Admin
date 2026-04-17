import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import client from "./client";
import { API_ENDPOINTS } from "@/config/api";
import { IAnnouncement, CreateAnnouncementRequest, UpdateAnnouncementRequest } from "@/types/admin";

const normalizeId = (item: any): any => {
  if (!item) return item;
  return {
    ...item,
    id: item.id || item._id,
  };
};

export const announcementsAPI = {
  getAll: async (params?: { page?: number; limit?: number }) => {
    const response = await client.get(`${API_ENDPOINTS.MARKETING}/announcements`, { params });
    const data = response.data.data;

    return {
      data: Array.isArray(data.data) ? data.data.map(normalizeId) : [],
      pagination: data.pagination,
    };
  },

  create: async (data: CreateAnnouncementRequest) => {
    const response = await client.post(`${API_ENDPOINTS.MARKETING}/announcements`, data);
    return normalizeId(response.data.data);
  },

  update: async (id: string, data: Partial<UpdateAnnouncementRequest>) => {
    const response = await client.put(`${API_ENDPOINTS.MARKETING}/announcements/${id}`, data);
    return normalizeId(response.data.data);
  },

  delete: async (id: string) => {
    return client.delete(`${API_ENDPOINTS.MARKETING}/announcements/${id}`).then((r) => r.data);
  },

  getStats: async (id: string) => {
    const response = await client.get(`${API_ENDPOINTS.MARKETING}/announcements/${id}/stats`);
    return response.data.data;
  },

  getActiveBroadcasts: async () => {
    const response = await client.get(`${API_ENDPOINTS.MARKETING}/announcements/active`);
    const data = response.data.data;
    return Array.isArray(data) ? data.map(normalizeId) : [];
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// REACT QUERY HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

export function useAnnouncements(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["marketing", "announcements", params],
    queryFn: () => announcementsAPI.getAll(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAnnouncementRequest) => announcementsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketing", "announcements"] });
      toast.success("Announcement created successfully");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || error.message || "Failed to create announcement";
      toast.error(message);
      console.error("Create announcement error:", error);
    },
  });
}

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UpdateAnnouncementRequest> }) =>
      announcementsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketing", "announcements"] });
      toast.success("Announcement updated successfully");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || error.message || "Failed to update announcement";
      toast.error(message);
      console.error("Update announcement error:", error);
    },
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => announcementsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketing", "announcements"] });
      toast.success("Announcement deleted successfully");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || error.message || "Failed to delete announcement";
      toast.error(message);
      console.error("Delete announcement error:", error);
    },
  });
}

export function useAnnouncementStats(id: string) {
  return useQuery({
    queryKey: ["marketing", "announcements", id, "stats"],
    queryFn: () => announcementsAPI.getStats(id),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useActiveBroadcasts() {
  return useQuery({
    queryKey: ["marketing", "announcements", "active"],
    queryFn: () => announcementsAPI.getActiveBroadcasts(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}