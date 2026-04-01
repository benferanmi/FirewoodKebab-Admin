import { useQuery } from "@tanstack/react-query";
import { dashboardAPI } from "@/services/api/dashboard";
 
export function useDashboardSummary(period?: string) {
  return useQuery({
    queryKey: ["dashboard", "summary", period],
    queryFn: () => dashboardAPI.getSummary(period),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 2,
    enabled: !!period, // Only fetch when period is provided
  });
}
 
export function useDashboardRevenue(params?: {
  period?: string;
  startDate?: string;
  endDate?: string;
  breakdown?: "category" | "paymentMethod" | "status";
  groupBy?: "day" | "week" | "month";
}) {
  return useQuery({
    queryKey: ["dashboard", "revenue", params],
    queryFn: () => dashboardAPI.getRevenue(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    // Enabled when we have either a period OR both start/end dates
    enabled: !!(params?.period || (params?.startDate && params?.endDate)),
  });
}
 
export function useDashboardTopItems(params?: {
  limit?: number;
  period?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ["dashboard", "topItems", params],
    queryFn: () => dashboardAPI.getTopItems(params),
    staleTime: 10 * 60 * 1000, // 10 minutes (changes less frequently)
    gcTime: 20 * 60 * 1000,
    retry: 2,
    // Enabled when we have either a period OR both start/end dates
    enabled: !!(params?.period || (params?.startDate && params?.endDate)),
  });
}

 
export function useDashboardOrderStats(params?: {
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ["dashboard", "orderStats", params],
    queryFn: () => dashboardAPI.getOrderStats(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    // Only fetch when both dates are provided
    enabled: !!(params?.startDate && params?.endDate),
  });
}

 
export function useDashboardPaymentStats(params?: {
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ["dashboard", "paymentStats", params],
    queryFn: () => dashboardAPI.getPaymentStats(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    // Only fetch when both dates are provided
    enabled: !!(params?.startDate && params?.endDate),
  });
}

 
export function useDashboardCustomerStats(params?: {
  period?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ["dashboard", "customerStats", params],
    queryFn: () => dashboardAPI.getCustomerStats(params),
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    retry: 2,
    // Enabled when we have either a period OR both start/end dates
    enabled: !!(params?.period || (params?.startDate && params?.endDate)),
  });
}
 
export function useDashboardOrderAnalytics(params?: {
  startDate?: string;
  endDate?: string;
  groupBy?: "day" | "week" | "month";
}) {
  return useQuery({
    queryKey: ["dashboard", "orderAnalytics", params],
    queryFn: () => dashboardAPI.getOrderAnalytics(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    // Only fetch when both dates are provided
    enabled: !!(params?.startDate && params?.endDate),
  });
}

 
export function useDashboardComprehensive(params?: {
  period?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ["dashboard", "comprehensive", params],
    queryFn: () => dashboardAPI.getComprehensive(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    // Enabled when we have either a period OR both start/end dates
    enabled: !!(params?.period || (params?.startDate && params?.endDate)),
  });
}

 
export function useDashboardRefresh() {
  const summary = useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: () => dashboardAPI.getSummary("30d"),
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
  });

  const revenue = useQuery({
    queryKey: ["dashboard", "revenue"],
    queryFn: () =>
      dashboardAPI.getRevenue({
        period: "30d",
        breakdown: "category",
      }),
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
  });

  const refetch = async () => {
    await Promise.all([summary.refetch(), revenue.refetch()]);
  };

  return {
    summary,
    revenue,
    refetch,
    isLoading: summary.isLoading || revenue.isLoading,
  };
}