import client from "./client";

export const toolsAPI = {
  // Cache Manager
  getCacheKeys: () =>
    client.get("/admin/tools/cache/keys").then((r) => r.data.data),
  clearCacheKey: (key: string) =>
    client.delete(`/admin/tools/cache/${key}`).then((r) => r.data.data),
  clearAllCache: () =>
    client.delete("/admin/tools/cache/all").then((r) => r.data.data),

  // Email Testing
  sendTestEmail: (email: string, templateType: string) =>
    client
      .post("/admin/tools/email/test", { recipientEmail: email, templateType })
      .then((r) => r.data.data),

  // System Health
  checkHealth: () =>
    client.get("/admin/tools/health").then((r) => r.data.data),

  // Exports
  exportCustomers: () =>
    client.get("/admin/tools/export/customers", { responseType: "blob" }),
  exportOrders: () =>
    client.get("/admin/tools/export/orders", { responseType: "blob" }),
  exportMenu: () =>
    client.get("/admin/tools/export/menu", { responseType: "blob" }),
  exportSettings: () =>
    client.get("/admin/tools/export/settings", { responseType: "blob" }),

  // Maintenance
  clearGuestCarts: () =>
    client
      .post("/admin/tools/maintenance/clear-guest-carts", {})
      .then((r) => r.data.data),
  expireOldCoupons: () =>
    client
      .post("/admin/tools/maintenance/expire-coupons", {})
      .then((r) => r.data.data),
  flushOldNotifications: () =>
    client
      .post("/admin/tools/maintenance/flush-notifications", {})
      .then((r) => r.data.data),
};