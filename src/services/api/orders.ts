import client from "./client";
import { API_ENDPOINTS } from "@/config/api";
import { Order, OrderStatus, PaymentStatus } from "@/types/admin";

export interface OrderFilters {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface UpdateStatusRequest {
  status: OrderStatus;
  note?: string;
}

export interface CancelOrderRequest {
  reason: string;
}

export interface RefundOrderRequest {
  amount: number;
  reason: string;
}

export const ordersAPI = {
  getOrders: (params?: OrderFilters) =>
    client
      .get(API_ENDPOINTS.ORDERS, { params })
      .then(
        (r) =>
          r.data as {
            success: boolean;
            data: Order[];
            pagination: PaginatedResponse<Order>["pagination"];
          },
      ),

  getOrder: (id: string) =>
    client
      .get(`${API_ENDPOINTS.ORDERS}/${id}`)
      .then((r) => r.data.data as Order),

  updateStatus: (id: string, data: UpdateStatusRequest) =>
    client
      .put(API_ENDPOINTS.ORDER_STATUS(id), data)
      .then((r) => r.data.data as Order),

  cancelOrder: (id: string, data: CancelOrderRequest) =>
    client.post(API_ENDPOINTS.ORDER_CANCEL(id), data).then((r) => r.data),

  refundOrder: (id: string, data: RefundOrderRequest) =>
    client.post(API_ENDPOINTS.ORDER_REFUND(id), data).then((r) => r.data),

  exportOrders: (params?: { format?: string; filters?: string }) =>
    client.get(API_ENDPOINTS.ORDERS_EXPORT, { params, responseType: "blob" }),
};
