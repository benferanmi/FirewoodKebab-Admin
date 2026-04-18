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

export interface SalesReportData {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    revenueChange: number;
  };
  dailyBreakdown: Array<{
    _id: string;
    revenue: number;
    orders: number;
    averageOrderValue: number;
  }>;
  categoryBreakdown: Array<{
    _id: string;
    revenue: number;
    orders: number;
  }>;
}

export interface OrdersReportData {
  summary: {
    totalOrders: number;
    cancellationRate: number;
    busiestHour: number;
    busiestDay: string;
  };
  statusBreakdown: Array<{
    _id: string;
    count: number;
    avgTime: number;
  }>;
  hourlyBreakdown: Array<{
    _id: number;
    count: number;
    revenue: number;
  }>;
  dayOfWeekBreakdown: Array<{
    _id: number;
    day: string;
    count: number;
    revenue: number;
  }>;
  heatmap: Array<{
    _id: { hour: number; dayOfWeek: number };
    count: number;
  }>;
}

export interface MenuPerformanceReportData {
  bestItems: Array<{
    _id: string;
    name: string;
    quantity: number;
    revenue: number;
    averagePrice: number;
  }>;
  worstItems: Array<{
    _id: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
  deadStock: Array<{
    _id: string;
    name: string;
  }>;
  categoryPerformance: Array<{
    _id: string;
    revenue: number;
    items: number;
  }>;
}

export interface CustomersReportData {
  summary: {
    newCustomers: number;
    returningCustomers: number;
    retentionRate: number;
    totalCustomers: number;
  };
  topCustomers: Array<{
    _id: string;
    name: string;
    email: string;
    phone: string;
    totalSpent: number;
    orderCount: number;
    lastOrder: Date;
  }>;
  locationBreakdown: Array<{
    _id: string;
    count: number;
    revenue: number;
  }>;
}

export interface DeliveryReportData {
  summary: {
    deliveryOrders: number;
    pickupOrders: number;
    deliveryPercentage: string;
    totalDeliveryFeeRevenue: number;
    freeDeliveryOrders: number;
  };
  typeBreakdown: Array<{
    _id: string;
    count: number;
    revenue: number;
    averageValue: number;
  }>;
  zoneBreakdown: Array<{
    _id: string;
    count: number;
    revenue: number;
    totalDeliveryFee: number;
  }>;
}

export interface DiscountsReportData {
  summary: {
    totalDiscountGiven: number;
    ordersWithDiscount: number;
    averageDiscount: string;
    discountPercentageOfRevenue: string;
  };
  couponStats: Array<{
    _id: string;
    usageCount: number;
    totalDiscount: number;
    revenue: number;
  }>;
  loyaltyStats: {
    totalRedeemedValue: number;
    ordersUsingDiscount: number;
  };
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
  getSalesReport: (params?: AnalyticsFilters) =>
    client
      .get("/admin/analytics/reports/sales", { params })
      .then((r) => r.data.data as SalesReportData),

  getOrdersReport: (params?: AnalyticsFilters) =>
    client
      .get("/admin/analytics/reports/orders", { params })
      .then((r) => r.data.data as OrdersReportData),

  getMenuPerformanceReport: (params?: AnalyticsFilters) =>
    client
      .get("/admin/analytics/reports/menu", { params })
      .then((r) => r.data.data as MenuPerformanceReportData),

  getCustomersReport: (params?: AnalyticsFilters) =>
    client
      .get("/admin/analytics/reports/customers", { params })
      .then((r) => r.data.data as CustomersReportData),

  getDeliveryReport: (params?: AnalyticsFilters) =>
    client
      .get("/admin/analytics/reports/delivery", { params })
      .then((r) => r.data.data as DeliveryReportData),

  getDiscountsReport: (params?: AnalyticsFilters) =>
    client
      .get("/admin/analytics/reports/discounts", { params })
      .then((r) => r.data.data as DiscountsReportData),

  // CSV Export methods
  exportSalesCSV: (params?: AnalyticsFilters) =>
    client
      .get("/admin/analytics/export/sales-csv", {
        params,
        responseType: "blob",
      })
      .then((r) => r.data),

  exportOrdersCSV: (params?: AnalyticsFilters) =>
    client
      .get("/admin/analytics/export/orders-csv", {
        params,
        responseType: "blob",
      })
      .then((r) => r.data),

  exportMenuCSV: (params?: AnalyticsFilters) =>
    client
      .get("/admin/analytics/export/menu-csv", {
        params,
        responseType: "blob",
      })
      .then((r) => r.data),

  exportCustomersCSV: (params?: AnalyticsFilters) =>
    client
      .get("/admin/analytics/export/customers-csv", {
        params,
        responseType: "blob",
      })
      .then((r) => r.data),

  exportDeliveryCSV: (params?: AnalyticsFilters) =>
    client
      .get("/admin/analytics/export/delivery-csv", {
        params,
        responseType: "blob",
      })
      .then((r) => r.data),

  exportDiscountsCSV: (params?: AnalyticsFilters) =>
    client
      .get("/admin/analytics/export/discounts-csv", {
        params,
        responseType: "blob",
      })
      .then((r) => r.data),

  // Generic export method used in ReportsPage
  exportReport: async (
    reportType: string,
    format: "csv" | "pdf",
    params?: AnalyticsFilters,
  ) => {
    const methodMap: {
      [key: string]: (p?: AnalyticsFilters) => Promise<Blob>;
    } = {
      sales: analyticsAPI.exportSalesCSV,
      orders: analyticsAPI.exportOrdersCSV,
      menu: analyticsAPI.exportMenuCSV,
      customers: analyticsAPI.exportCustomersCSV,
      delivery: analyticsAPI.exportDeliveryCSV,
      discounts: analyticsAPI.exportDiscountsCSV,
    };

    const method = methodMap[reportType];
    if (!method) throw new Error(`Unknown report type: ${reportType}`);

    return method(params);
  },
};
