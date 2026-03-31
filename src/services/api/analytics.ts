import client from "./client";
import { API_ENDPOINTS } from "@/config/api";

export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  groupBy?: "day" | "week" | "month" | string;
  period?: "7d" | "30d" | "90d";
}

// Updated to match backend aggregation response
export interface OrderAnalytics {
  _id: string; // formatted date string
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export interface RevenueBreakdown {
  _id: string; // category name or payment method
  total: number;
  count: number;
}

export interface CustomerAnalytics {
  newCustomers: number;
  totalCustomers: number;
  returningCustomers: number;
}

export interface ItemPerformance {
  _id: string;
  name: string;
  totalQuantity: number;
  totalRevenue: number;
}

export interface PaymentMethodAnalytics {
  _id: string; // payment method name
  count: number;
  total: number;
}

export const analyticsAPI = {
  getOrderAnalytics: (params?: AnalyticsFilters) =>
    client
      .get(API_ENDPOINTS.ANALYTICS_ORDERS, { params })
      .then((r) => r.data.data as OrderAnalytics[]),

  getRevenueBreakdown: (
    params?: AnalyticsFilters & { breakdown?: "category" | "paymentMethod" },
  ) =>
    client
      .get(API_ENDPOINTS.ANALYTICS_REVENUE, { params })
      .then((r) => r.data.data as RevenueBreakdown[]),

  getCustomerAnalytics: (params?: AnalyticsFilters) =>
    client
      .get(API_ENDPOINTS.ANALYTICS_CUSTOMERS, { params })
      .then((r) => r.data.data as CustomerAnalytics),

  getItemsPerformance: (params?: AnalyticsFilters & { limit?: number }) =>
    client
      .get(API_ENDPOINTS.ANALYTICS_ITEMS_PERFORMANCE, { params })
      .then((r) => r.data.data as ItemPerformance[]),

  getPaymentMethods: (params?: AnalyticsFilters) =>
    client
      .get(API_ENDPOINTS.ANALYTICS_PAYMENT_METHODS, { params })
      .then((r) => r.data.data as PaymentMethodAnalytics[]),
};
