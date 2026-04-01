import client from "./client";
import { API_ENDPOINTS } from "@/config/api";

export interface DashboardSummary {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  newCustomers: number;
  averageOrderValue: number;
  period: string;
  orderChange: number;
  revenueChange: number;
  customerChange: number;
}

export interface RevenueDataPoint {
  _id: string;
  date?: string;
  revenue?: number;
  total?: number;
  count?: number;
}

export interface TopItemData {
  _id: string;
  name: string;
  totalQuantity: number;
  totalRevenue: number;
}

export interface OrderStatsData {
  _id: string;
  status: string;
  count: number;
  total: number;
  percentageOfTotal: number;
}

export interface PaymentMethodStats {
  _id: string;
  count: number;
  total: number;
  percentage: number;
}

export interface CustomerStatsData {
  newCustomers: number;
  totalCustomers: number;
  returningCustomers: number;
  repeatRate: number;
}

export const dashboardAPI = {
  getSummary: (period?: string) =>
    client
      .get(API_ENDPOINTS.DASHBOARD_SUMMARY, { params: { period } })
      .then((r) => r.data.data as DashboardSummary)
      .catch((error) => {
        console.error("Failed to fetch dashboard summary:", error);
        throw error;
      }),

  getRevenue: (params?: {
    period?: string;
    startDate?: string;
    endDate?: string;
    breakdown?: "category" | "paymentMethod" | "status";
    groupBy?: "day" | "week" | "month";
  }) =>
    client
      .get(API_ENDPOINTS.DASHBOARD_REVENUE, { params })
      .then((r) => r.data.data as RevenueDataPoint[])
      .catch((error) => {
        console.error("Failed to fetch revenue data:", error);
        throw error;
      }),

  getTopItems: (params?: {
    limit?: number;
    period?: string;
    startDate?: string;
    endDate?: string;
  }) =>
    client
      .get(API_ENDPOINTS.DASHBOARD_TOP_ITEMS, { params })
      .then((r) => r.data.data as TopItemData[])
      .catch((error) => {
        console.error("Failed to fetch top items:", error);
        throw error;
      }),

  getOrderStats: (params?: { startDate?: string; endDate?: string }) =>
    client
      .get(API_ENDPOINTS.DASHBOARD_ORDER_STATS, { params })
      .then((r) => r.data.data as OrderStatsData[])
      .catch((error) => {
        console.error("Failed to fetch order stats:", error);
        throw error;
      }),

  getPaymentStats: (params?: { startDate?: string; endDate?: string }) =>
    client
      .get(API_ENDPOINTS.DASHBOARD_PAYMENT_STATS, { params })
      .then((r) => r.data.data as PaymentMethodStats[])
      .catch((error) => {
        console.error("Failed to fetch payment stats:", error);
        throw error;
      }),

  getCustomerStats: (params?: {
    period?: string;
    startDate?: string;
    endDate?: string;
  }) =>
    client
      .get(API_ENDPOINTS.DASHBOARD_CUSTOMER_STATS, { params })
      .then((r) => r.data.data as CustomerStatsData)
      .catch((error) => {
        console.error("Failed to fetch customer stats:", error);
        throw error;
      }),

  getOrderAnalytics: (params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: "day" | "week" | "month";
  }) =>
    client
      .get(API_ENDPOINTS.DASHBOARD_ORDER_ANALYTICS, { params })
      .then((r) => r.data.data as RevenueDataPoint[])
      .catch((error) => {
        console.error("Failed to fetch order analytics:", error);
        throw error;
      }),

  getComprehensive: (params?: {
    period?: string;
    startDate?: string;
    endDate?: string;
  }) =>
    client
      .get(API_ENDPOINTS.DASHBOARD_COMPREHENSIVE, { params })
      .then((r) => r.data.data)
      .catch((error) => {
        console.error("Failed to fetch comprehensive dashboard:", error);
        throw error;
      }),
};
