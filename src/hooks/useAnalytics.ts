import { useQuery } from "@tanstack/react-query";
import { analyticsAPI, AnalyticsFilters } from "@/services/api/analytics";

// Helper to convert 7d, 30d, 90d periods to date range
const getPeriodDateRange = (period: "7d" | "30d" | "90d" = "7d") => {
  const endDate = new Date();
  const startDate = new Date();
  
  const daysMap = { "7d": 7, "30d": 30, "90d": 90 };
  startDate.setDate(endDate.getDate() - daysMap[period]);
  
  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
  };
};

export function useOrderAnalytics(params?: AnalyticsFilters) {
  // Convert period to date range if provided
  const queryParams = params?.period
    ? { ...getPeriodDateRange(params.period), groupBy: "day" }
    : params;

  return useQuery({
    queryKey: ["analytics", "orders", queryParams],
    queryFn: () => analyticsAPI.getOrderAnalytics(queryParams),
    // placeholderData: orderTrendData.map((d) => ({
    //   _id: d.date,
    //   totalOrders: d.orders,
    //   totalRevenue: d.orders * 8250, // Estimated based on avg order value
    //   averageOrderValue: 8250,
    // })),
  });
}

export function useRevenueAnalytics(
  params?: AnalyticsFilters & { breakdown?: "category" | "paymentMethod" }
) {
  // Convert period to date range if provided
  const queryParams = params?.period
    ? {
        ...getPeriodDateRange(params.period),
        breakdown: params.breakdown || "category",
      }
    : params;

  return useQuery({
    queryKey: ["analytics", "revenue", queryParams],
    queryFn: () => analyticsAPI.getRevenueBreakdown(queryParams),
    // placeholderData: topItemsData.map((d) => ({
    //   _id: d.name,
    //   total: d.revenue,
    //   count: d.quantity,
    // })),
  });
}

export function useCustomerAnalytics(params?: AnalyticsFilters) {
  // Convert period to date range if provided
  const queryParams = params?.period
    ? { ...getPeriodDateRange(params.period) }
    : params;

  return useQuery({
    queryKey: ["analytics", "customers", queryParams],
    queryFn: () => analyticsAPI.getCustomerAnalytics(queryParams),
    placeholderData: {
      newCustomers: 45,
      totalCustomers: 186,
      returningCustomers: 120,
    },
  });
}

export function useItemsPerformance(
  params?: AnalyticsFilters & { limit?: number }
) {
  // Convert period to date range if provided
  const queryParams = params?.period
    ? { ...getPeriodDateRange(params.period), limit: params.limit || 20 }
    : params;

  return useQuery({
    queryKey: ["analytics", "items", queryParams],
    queryFn: () => analyticsAPI.getItemsPerformance(queryParams),
    // placeholderData: topItemsData.map((d) => ({
    //   _id: d.name,
    //   name: d.name,
    //   totalQuantity: d.quantity,
    //   totalRevenue: d.revenue,
    // })),
  });
}

export function usePaymentMethodAnalytics(params?: AnalyticsFilters) {
  // Convert period to date range if provided
  const queryParams = params?.period
    ? { ...getPeriodDateRange(params.period) }
    : params;

  return useQuery({
    queryKey: ["analytics", "paymentMethods", queryParams],
    queryFn: () => analyticsAPI.getPaymentMethods(queryParams),
    placeholderData: [
      { _id: "stripe", count: 45, total: 450000 },
      { _id: "cash", count: 30, total: 300000 },
    ],
  });
}

export function useSalesReportFull(
  params?: AnalyticsFilters & { breakdown?: "category" | "paymentMethod" }
) {
  return useQuery({
    queryKey: ["analytics", "reports", "sales", params],
    queryFn: () => analyticsAPI.getSalesReport(params),
  });
}
 
export function useOrdersReportFull(params?: AnalyticsFilters) {
  return useQuery({
    queryKey: ["analytics", "reports", "orders", params],
    queryFn: () => analyticsAPI.getOrdersReport(params),
  });
}
 
export function useMenuPerformanceReport(params?: AnalyticsFilters) {
  return useQuery({
    queryKey: ["analytics", "reports", "menu", params],
    queryFn: () => analyticsAPI.getMenuPerformanceReport(params),
  });
}
 
export function useCustomersReportFull(params?: AnalyticsFilters) {
  return useQuery({
    queryKey: ["analytics", "reports", "customers", params],
    queryFn: () => analyticsAPI.getCustomersReport(params),
  });
}
 
export function useDeliveryReportFull(params?: AnalyticsFilters) {
  return useQuery({
    queryKey: ["analytics", "reports", "delivery", params],
    queryFn: () => analyticsAPI.getDeliveryReport(params),
  });
}
 
export function useDiscountsReport(params?: AnalyticsFilters) {
  return useQuery({
    queryKey: ["analytics", "reports", "discounts", params],
    queryFn: () => analyticsAPI.getDiscountsReport(params),
  });
}
 