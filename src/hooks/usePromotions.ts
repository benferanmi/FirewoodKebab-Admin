import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { promotionsAPI, CreateCouponRequest, CreateBannerRequest } from "@/services/api/promotions";
import { toast } from "sonner";

export function useCoupons(params?: { page?: number; limit?: number; status?: string }) {
  return useQuery({
    queryKey: ["promotions", "coupons", params],
    queryFn: () => promotionsAPI.getCoupons(params),
    // placeholderData: { data: mockCoupons, pagination: undefined },
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCouponRequest) => promotionsAPI.createCoupon(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions", "coupons"] });
      toast.success("Coupon created");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create coupon");
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
      toast.success("Coupon updated");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update coupon");
    },
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => promotionsAPI.deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions", "coupons"] });
      toast.success("Coupon deleted");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete coupon");
    },
  });
}

export function useBanners() {
  return useQuery({
    queryKey: ["promotions", "banners"],
    queryFn: () => promotionsAPI.getBanners(),
    placeholderData: [],
  });
}

export function useCreateBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBannerRequest) => promotionsAPI.createBanner(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions", "banners"] });
      toast.success("Banner created");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create banner");
    },
  });
}

export function useDeleteBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => promotionsAPI.deleteBanner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions", "banners"] });
      toast.success("Banner deleted");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete banner");
    },
  });
}
