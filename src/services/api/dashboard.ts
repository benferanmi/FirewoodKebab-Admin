import client from "./client";
import { API_ENDPOINTS } from "@/config/api";

export interface DashboardSummary {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  newCustomers: number;
  averageOrderValue: number;
  period: string;
  topItem: { name: string; orders: number; revenue: number };
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
}

export interface TopItemData {
  _id: string;
  name: string;
  totalQuantity: number;
  totalRevenue: number;
}

export interface CustomerStatsData {
  newCustomers: number;
  totalCustomers: number;
  activeCustomers: number;
}

export const dashboardAPI = {
  getSummary: (period?: string) =>
    client
      .get(API_ENDPOINTS.DASHBOARD_SUMMARY, { params: { period } })
      .then((r) => r.data.data as DashboardSummary),

  getRevenue: (params?: {
    period?: string;
    startDate?: string;
    endDate?: string;
  }) =>
    client
      .get(API_ENDPOINTS.DASHBOARD_REVENUE, { params })
      .then((r) => r.data.data as RevenueDataPoint[]),

  getTopItems: (params?: { limit?: number; period?: string }) =>
    client
      .get(API_ENDPOINTS.DASHBOARD_TOP_ITEMS, { params })
      .then((r) => r.data.data as TopItemData[]),

  getCustomerStats: (period?: string) =>
    client
      .get(API_ENDPOINTS.DASHBOARD_CUSTOMER_STATS, { params: { period } })
      .then((r) => r.data.data as CustomerStatsData),
};
