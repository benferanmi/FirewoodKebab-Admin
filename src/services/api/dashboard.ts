import client from "./client";
import { API_ENDPOINTS } from "@/config/api";

//  Today Snapshot
export interface TodaySnapshot {
  totalRevenue: number;
  totalOrders: number;
  newCustomers: number;
  pendingOrders: number;
}

//  Order Status
export interface OrderStatusCount {
  status: string;
  count: number;
}

//  Live Orders
export interface LiveOrder {
  _id: string;
  orderNumber: string;
  customerName: string;
  itemsCount: number;
  total: number;
  status: "pending" | "confirmed" | "preparing" | "out_for_delivery";
  createdAt: string;
}

//  Summary Cards─
export interface SummaryCards {
  menu: {
    published: number;
    categories: number;
    unavailable: number;
  };
  customers: {
    total: number;
    newToday: number;
    blocked: number;
  };
  reviews: {
    approved: number;
    pending: number;
    averageRating: number;
  };
  promotions: {
    activeCoupons: number;
    activeBanners: number;
    activeAnnouncements: number;
  };
}

//  Recent Orders─
export interface RecentOrder {
  _id: string;
  orderNumber: string;
  customerName: string;
  itemsCount: number;
  total: number;
  status: string;
  createdAt: string;
}

//  API
export const dashboardAPI = {

  getToday: () =>
    client
      .get(API_ENDPOINTS.DASHBOARD_SUMMARY, { params: { period: "today" } })
      .then((r) => r.data.data as TodaySnapshot),

  getOrderStatus: () =>
    client
      .get(API_ENDPOINTS.DASHBOARD_TODAY_ORDER_STATUS)
      .then((r) => r.data.data as OrderStatusCount[]),

  getLiveOrders: () =>
    client
      .get(API_ENDPOINTS.DASHBOARD_LIVE_ORDERS)
      .then((r) => r.data.data as LiveOrder[]),

  getSummaryCards: () =>
    client
      .get(API_ENDPOINTS.DASHBOARD_SUMMARY_CARDS)
      .then((r) => r.data.data as SummaryCards),

  getRecentOrders: () =>
    client
      .get(API_ENDPOINTS.DASHBOARD_RECENT_ORDERS)
      .then((r) => r.data.data as RecentOrder[]),
};