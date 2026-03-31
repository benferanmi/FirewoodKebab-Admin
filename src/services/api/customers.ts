import client from "./client";
import { API_ENDPOINTS } from "@/config/api";
import { Customer } from "@/types/admin";

export interface CustomerFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "name" | "spend" | "orders";
}

export const customersAPI = {
  getCustomers: (params?: CustomerFilters) =>
    client.get(API_ENDPOINTS.CUSTOMERS, { params }).then((r) => r.data as { data: Customer[]; pagination?: any }),

  getCustomer: (id: string) =>
    client.get(API_ENDPOINTS.CUSTOMER(id)).then((r) => r.data.data as Customer),

  updateCustomer: (id: string, data: Partial<Customer>) =>
    client.put(API_ENDPOINTS.CUSTOMER(id), data).then((r) => r.data.data as Customer),

  blockCustomer: (id: string, reason: string) =>
    client.put(API_ENDPOINTS.CUSTOMER_BLOCK(id), { reason }).then((r) => r.data),

  unblockCustomer: (id: string) =>
    client.put(API_ENDPOINTS.CUSTOMER_UNBLOCK(id)).then((r) => r.data),

  getCustomerOrders: (id: string, params?: { page?: number; limit?: number }) =>
    client.get(API_ENDPOINTS.CUSTOMER_ORDERS(id), { params }).then((r) => r.data),
};
