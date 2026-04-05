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
  _id?: string;
  id?: string;
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

// Helper to normalize _id to id
const normalizeId = (item: any): any => {
  if (!item) return item;
  return {
    ...item,
    id: item.id || item._id,
  };
};

export const promotionsAPI = {
  // Coupons
  getCoupons: async (params?: { page?: number; limit?: number; status?: string }) => {
    const response = await client.get(API_ENDPOINTS.COUPONS, { params });
    const data = response.data.data;
    
    // Normalize the response
    return {
      data: data.data?.map(normalizeId) || data?.map?.(normalizeId) || [],
      pagination: data.pagination,
    };
  },

  createCoupon: async (data: CreateCouponRequest) => {
    const response = await client.post(API_ENDPOINTS.COUPONS, data);
    return normalizeId(response.data.data);
  },

  updateCoupon: async (id: string, data: Partial<CreateCouponRequest>) => {
    const response = await client.put(API_ENDPOINTS.COUPON(id), data);
    return normalizeId(response.data.data);
  },

  deleteCoupon: async (id: string) => {
    return client.delete(API_ENDPOINTS.COUPON(id)).then((r) => r.data);
  },

  getCouponUsage: async (id: string) => {
    const response = await client.get(API_ENDPOINTS.COUPON_USAGE(id));
    return {
      ...response.data,
      coupon: normalizeId(response.data.coupon),
    };
  },

  // Banners
  getBanners: async () => {
    const response = await client.get(API_ENDPOINTS.BANNERS);
    
    // Handle both array and wrapped response
    const bannerData = Array.isArray(response.data) 
      ? response.data 
      : (Array.isArray(response.data.data) ? response.data.data : []);
    
    return bannerData.map(normalizeId);
  },

  createBanner: async (data: CreateBannerRequest) => {
    const response = await client.post(API_ENDPOINTS.BANNERS, data);
    return normalizeId(response.data.data);
  },

  updateBanner: async (id: string, data: Partial<CreateBannerRequest>) => {
    const response = await client.put(API_ENDPOINTS.BANNER(id), data);
    return normalizeId(response.data.data);
  },

  deleteBanner: async (id: string) => {
    return client.delete(API_ENDPOINTS.BANNER(id)).then((r) => r.data);
  },
};