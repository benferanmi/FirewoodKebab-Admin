import { useQuery } from "@tanstack/react-query";
import { dashboardAPI } from "@/services/api/dashboard";


export function useDashboardSummary(period?: string) {
  return useQuery({
    queryKey: ["dashboard", "summary", period],
    queryFn: () => dashboardAPI.getSummary(period),
    // placeholderData: {
    //   ordersToday: 47,
    //   revenueToday: 482000,
    //   pendingOrders: mockOrders.filter((o) => o.status === "pending").length,
    //   newCustomersToday: 12,
    //   averageOrderValue: 8250,
    //   topItem: { name: "Jollof Rice", orders: 156, revenue: 546000 },
    // },
  });
}

export function useDashboardRevenue(params?: {
  period?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ["dashboard", "revenue", params],
    queryFn: () => dashboardAPI.getRevenue(params),
    // placeholderData: revenueData,
  });
}

export function useDashboardTopItems(params?: {
  limit?: number;
  period?: string;
}) {
  return useQuery({
    queryKey: ["dashboard", "topItems", params],
    queryFn: () => dashboardAPI.getTopItems(params),
    // placeholderData: topItemsData,
  });
}

export function useDashboardOrderTrend() {
  return useQuery({
    queryKey: ["dashboard", "orderTrend"],
    queryFn: () => dashboardAPI.getRevenue({ period: "daily" }),
    // placeholderData: orderTrendData.map((d) => ({ date: d.date, revenue: 0 })),
  });
}
