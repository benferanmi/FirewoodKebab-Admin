import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ordersAPI,
  OrderFilters,
  UpdateStatusRequest,
  CancelOrderRequest,
  RefundOrderRequest,
} from "@/services/api/orders";
import { toast } from "sonner";

export function useOrders(filters?: OrderFilters) {
  return useQuery({
    queryKey: ["orders", filters],
    queryFn: () => ordersAPI.getOrders(filters),
    // placeholderData: {
    //   success: true,
    //   data: mockOrders,
    //   pagination: { total: mockOrders.length, page: 1, limit: 20, totalPages: 1, hasNext: false, hasPrev: false },
    // },
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["orders", id],
    queryFn: () => ordersAPI.getOrder(id),
    enabled: !!id,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStatusRequest }) =>
      ordersAPI.updateStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Order status updated");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update order status",
      );
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CancelOrderRequest }) =>
      ordersAPI.cancelOrder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Order cancelled");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to cancel order");
    },
  });
}

export function useRefundOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RefundOrderRequest }) =>
      ordersAPI.refundOrder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Refund initiated");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to process refund");
    },
  });
}

export function useExportOrders() {
  return useMutation({
    mutationFn: (params: { format?: string }) => ordersAPI.exportOrders(params),
    onSuccess: (response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `orders-export.${response.headers["content-type"]?.includes("csv") ? "csv" : "xlsx"}`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Export downloaded");
    },
    onError: () => {
      toast.error("Failed to export orders");
    },
  });
}
