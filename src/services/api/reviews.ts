import client from "./client";
import { API_ENDPOINTS } from "@/config/api";
import { Review } from "@/types/admin";

export interface ReviewFilters {
  status?: "pending" | "approved" | "hidden";
  page?: number;
  limit?: number;
}

export const reviewsAPI = {
  getReviews: (params?: ReviewFilters) =>
    client.get(API_ENDPOINTS.REVIEWS, { params }).then((r) => r.data as { data: Review[]; pagination?: any }),

  getReview: (id: string) =>
    client.get(API_ENDPOINTS.REVIEW(id)).then((r) => r.data.data as Review),

  approveReview: (id: string, adminNotes?: string) =>
    client.put(API_ENDPOINTS.REVIEW_APPROVE(id), { adminNotes }).then((r) => r.data.data as Review),

  hideReview: (id: string, reason: string) =>
    client.put(API_ENDPOINTS.REVIEW_HIDE(id), { reason }).then((r) => r.data.data as Review),

  deleteReview: (id: string) =>
    client.delete(API_ENDPOINTS.REVIEW(id)).then((r) => r.data),
};
