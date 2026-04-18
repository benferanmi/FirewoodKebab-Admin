// Base API URL — change this to your actual backend
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

export const API_ENDPOINTS = {
  // Auth
  AUTH_LOGIN: "/admin/auth/login",
  AUTH_LOGOUT: "/admin/auth/logout",
  AUTH_REFRESH: "/admin/auth/refresh-token",
  UPLOAD_SIGNATURE: "/upload/admin/signature",

  // Dashboard
  DASHBOARD_SUMMARY: "/admin/dashboard/summary",
  DASHBOARD_REVENUE: "/admin/dashboard/revenue",
  DASHBOARD_TOP_ITEMS: "/admin/dashboard/top-items",
  DASHBOARD_CUSTOMER_STATS: "/admin/dashboard/customer-stats",
  DASHBOARD_COMPREHENSIVE: "/admin/dashboard/comprehensive-stats",
  DASHBOARD_ORDER_ANALYTICS: "/admin/dashboard/order-analytics",
  DASHBOARD_ORDER_STATS: "/admin/dashboard/order-stats",
  DASHBOARD_PAYMENT_STATS: "/admin/dashboard/payment-stats",
  DASHBOARD_TODAY_ORDER_STATUS: "/admin/dashboard/today-order-status",
  DASHBOARD_LIVE_ORDERS: "/admin/dashboard/live-orders",
  DASHBOARD_SUMMARY_CARDS: "/admin/dashboard/summary-cards",
  DASHBOARD_RECENT_ORDERS: "/admin/dashboard/recent-orders",

  // Orders
  ORDERS: "/admin/orders",
  ORDER_STATUS: (id: string) => `/admin/orders/${id}/status`,
  ORDER_CANCEL: (id: string) => `/admin/orders/${id}/cancel`,
  ORDER_REFUND: (id: string) => `/admin/orders/${id}/refund`,
  ORDERS_EXPORT: "/admin/orders/export",

  // Menu
  MENU_CATEGORIES: "/admin/menu/categories",
  MENU_CATEGORIES_REORDER: "/admin/menu/categories/reorder",
  MENU_ITEMS: "/admin/menu/items",
  MENU_ITEM: (id: string) => `/admin/menu/items/${id}`,
  MENU_ITEM_AVAILABILITY: (id: string) =>
    `/admin/menu/items/${id}/availability`,
  MENU_ITEMS_BULK_AVAILABILITY: "/admin/menu/items/bulk-availability",

  // Customers
  CUSTOMERS: "/admin/customers",
  CUSTOMER: (id: string) => `/admin/customers/${id}`,
  CUSTOMER_BLOCK: (id: string) => `/admin/customers/${id}/block`,
  CUSTOMER_UNBLOCK: (id: string) => `/admin/customers/${id}/unblock`,
  CUSTOMER_ORDERS: (id: string) => `/admin/customers/${id}/orders`,

  // Marketing
  COUPONS: "/admin/marketing/coupons",
  COUPON: (id: string) => `/admin/marketing/coupons/${id}`,
  COUPON_USAGE: (id: string) => `/admin/marketing/coupons/${id}/usage`,
  BANNERS: "/admin/marketing/banners",
  BANNER: (id: string) => `/admin/marketing/banners/${id}`,
  // Announcements (Admin)
  ANNOUNCEMENTS: "/admin/marketing/announcements",
  ANNOUNCEMENT: (id: string) => `/admin/marketing/announcements/${id}`,
  ANNOUNCEMENT_STATS: (id: string) =>
    `/admin/marketing/announcements/${id}/stats`,
  MARKETING: "/admin/marketing",
  MARKETING_PUBLIC: "/marketing",
  // Reviews
  REVIEWS: "/admin/reviews",
  REVIEW: (id: string) => `/admin/reviews/${id}`,
  REVIEW_APPROVE: (id: string) => `/admin/reviews/${id}/approve`,
  REVIEW_HIDE: (id: string) => `/admin/reviews/${id}/hide`,

  // Analytics
  ANALYTICS_ORDERS: "/admin/analytics/orders",
  ANALYTICS_REVENUE: "/admin/analytics/revenue",
  ANALYTICS_CUSTOMERS: "/admin/analytics/customers",
  ANALYTICS_ITEMS_PERFORMANCE: "/admin/analytics/items-performance",
  ANALYTICS_PAYMENT_METHODS: "/admin/analytics/payment-methods",
  ANALYTICS_EXPORT: "/admin/analytics/export",

  // Team
  TEAM: "/admin/team",
  TEAM_MEMBER: (id: string) => `/admin/team/${id}`,
  TEAM_ACTIVITY: "/admin/team/activity",

  // Settings
  SETTINGS_RESTAURANT: "/admin/settings/restaurant",
  SETTINGS_DELIVERY: "/admin/settings/delivery",
  SETTINGS_PAYMENT: "/admin/settings/payment",
  SETTINGS_EMAIL: "/admin/settings/email",
  SETTINGS_TEST_EMAIL: "/admin/settings/send-test-email",

  // Content
  CONTENT_HOME: "/admin/content/pages/home",
  CONTENT_GALLERY: "/admin/content/gallery",
  CONTENT_GALLERY_ITEM: (id: string) => `/admin/content/gallery/${id}`,
} as const;
