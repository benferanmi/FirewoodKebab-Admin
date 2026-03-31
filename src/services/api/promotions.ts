import client from "./client";
import { API_ENDPOINTS } from "@/config/api";
import { Coupon } from "@/types/admin";

export interface CreateCouponRequest {
  code: string;
  type: "fixed_amount" | "percentage";
  value: number;
  description?: string;
  minOrderAmount?: number;
  maxUsagePerUser?: number;
  maxTotalUsage?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface Banner {
  id: string;
  title: string;
  description?: string;
  image: string;
  ctaText?: string;
  ctaLink?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBannerRequest {
  title: string;
  description?: string;
  image: string;
  ctaText?: string;
  ctaLink?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export const promotionsAPI = {
  // Coupons
  getCoupons: (params?: { page?: number; limit?: number; status?: string }) =>
    client.get(API_ENDPOINTS.COUPONS, { params }).then((r) => r.data as { data: Coupon[]; pagination?: any }),

  createCoupon: (data: CreateCouponRequest) =>
    client.post(API_ENDPOINTS.COUPONS, data).then((r) => r.data.data as Coupon),

  updateCoupon: (id: string, data: Partial<CreateCouponRequest>) =>
    client.put(API_ENDPOINTS.COUPON(id), data).then((r) => r.data.data as Coupon),

  deleteCoupon: (id: string) =>
    client.delete(API_ENDPOINTS.COUPON(id)).then((r) => r.data),

  getCouponUsage: (id: string) =>
    client.get(API_ENDPOINTS.COUPON_USAGE(id)).then((r) => r.data),

  // Banners
  getBanners: () =>
    client.get(API_ENDPOINTS.BANNERS).then((r) => r.data.data as Banner[]),

  createBanner: (data: CreateBannerRequest) =>
    client.post(API_ENDPOINTS.BANNERS, data).then((r) => r.data.data as Banner),

  updateBanner: (id: string, data: Partial<CreateBannerRequest>) =>
    client.put(API_ENDPOINTS.BANNER(id), data).then((r) => r.data.data as Banner),

  deleteBanner: (id: string) =>
    client.delete(API_ENDPOINTS.BANNER(id)).then((r) => r.data),
};
