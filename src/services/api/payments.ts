import client from "./client";

export const paymentsAPI = {
  getOverview: () =>
    client.get("/admin/payments/overview").then((r) => r.data.data),
  getTransactions: (params?: any) =>
    client
      .get("/admin/payments/transactions", { params })
      .then((r) => r.data.data),
  getTransaction: (id: string) =>
    client.get(`/admin/payments/transactions/${id}`).then((r) => r.data.data),
  exportTransactions: (params?: any) =>
    client
      .get("/admin/payments/transactions/export", {
        params,
        responseType: "blob",
      })
      .then((r) => r.data),
  getRefunds: () =>
    client.get("/admin/payments/refunds").then((r) => r.data.data),
  issueRefund: (data: { orderId: string; amount?: number; reason?: string }) =>
    client.post("/admin/payments/refunds", data).then((r) => r.data.data),
  getPayouts: () =>
    client.get("/admin/payments/payouts").then((r) => r.data.data),
  getSettings: () =>
    client.get("/admin/payments/settings").then((r) => r.data.data),
  updateSettings: (data: any) =>
    client.put("/admin/payments/settings", data).then((r) => r.data.data),
};
