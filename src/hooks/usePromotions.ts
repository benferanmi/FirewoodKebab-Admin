import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { promotionsAPI, CreateCouponRequest, CreateBannerRequest } from "@/services/api/promotions";
import { toast } from "sonner";

export function useCoupons(params?: { page?: number; limit?: number; status?: string }) {
  return useQuery({
    queryKey: ["promotions", "coupons", params],
    queryFn: () => promotionsAPI.getCoupons(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCouponRequest) => promotionsAPI.createCoupon(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions", "coupons"] });
      toast.success("Coupon created successfully");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || "Failed to create coupon";
      toast.error(message);
      console.error("Create coupon error:", error);
    },
  });
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateCouponRequest> }) =>
      promotionsAPI.updateCoupon(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions", "coupons"] });
      toast.success("Coupon updated successfully");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || "Failed to update coupon";
      toast.error(message);
      console.error("Update coupon error:", error);
    },
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => promotionsAPI.deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions", "coupons"] });
      toast.success("Coupon deleted successfully");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || "Failed to delete coupon";
      toast.error(message);
      console.error("Delete coupon error:", error);
    },
  });
}

export function useBanners() {
  return useQuery({
    queryKey: ["promotions", "banners"],
    queryFn: () => promotionsAPI.getBanners(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCreateBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBannerRequest) => promotionsAPI.createBanner(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions", "banners"] });
      toast.success("Banner created successfully");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || "Failed to create banner";
      toast.error(message);
      console.error("Create banner error:", error);
    },
  });
}

export function useUpdateBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateBannerRequest> }) =>
      promotionsAPI.updateBanner(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions", "banners"] });
      toast.success("Banner updated successfully");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || "Failed to update banner";
      toast.error(message);
      console.error("Update banner error:", error);
    },
  });
}

export function useDeleteBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => promotionsAPI.deleteBanner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions", "banners"] });
      toast.success("Banner deleted successfully");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || "Failed to delete banner";
      toast.error(message);
      console.error("Delete banner error:", error);
    },
  });
}