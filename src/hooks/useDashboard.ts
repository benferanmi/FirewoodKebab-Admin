import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { dashboardAPI, LiveOrder } from "@/services/api/dashboard";
import { getAdminSocket } from "./useSocket";

// ─── Query Keys ────────────────────────────────────────────────────────────────
export const DASHBOARD_KEYS = {
  today: ["dashboard", "today"] as const,
  orderStatus: ["dashboard", "orderStatus"] as const,
  liveOrders: ["dashboard", "liveOrders"] as const,
  summaryCards: ["dashboard", "summaryCards"] as const,
  recentOrders: ["dashboard", "recentOrders"] as const,
};

// ─── Row 1: Today's Snapshot ───────────────────────────────────────────────────
export function useDashboardToday() {
  return useQuery({
    queryKey: DASHBOARD_KEYS.today,
    queryFn: dashboardAPI.getToday,
    staleTime: 30 * 1000,
    gcTime: 2 * 60 * 1000,
    retry: 2,
    refetchInterval: 60 * 1000,
  });
}

// ─── Row 2: Order Status Overview ─────────────────────────────────────────────
export function useDashboardOrderStatus() {
  return useQuery({
    queryKey: DASHBOARD_KEYS.orderStatus,
    queryFn: dashboardAPI.getOrderStatus,
    staleTime: 30 * 1000,
    gcTime: 2 * 60 * 1000,
    retry: 2,
    refetchInterval: 60 * 1000,
  });
}

// ─── Row 3: Live Orders Feed ───────────────────────────────────────────────────
export function useLiveOrders() {
  const queryClient = useQueryClient();
  const removalTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  const { data, isLoading, error } = useQuery({
    queryKey: DASHBOARD_KEYS.liveOrders,
    queryFn: dashboardAPI.getLiveOrders,
    staleTime: 15 * 1000,
    gcTime: 2 * 60 * 1000,
    retry: 2,
  });

  useEffect(() => {
    const socket = getAdminSocket();
    if (!socket) return;

    const handleNewOrder = (order: LiveOrder) => {
      queryClient.setQueryData<LiveOrder[]>(
        DASHBOARD_KEYS.liveOrders,
        (prev = []) => [order, ...prev],
      );

      // Invalidate counts so Row 1 + Row 2 stay accurate
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEYS.today });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEYS.orderStatus });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEYS.recentOrders });

      toast.success(`New order #${order.orderNumber}`, {
        description: `${order.customerName} · ${order.itemsCount} item${order.itemsCount !== 1 ? "s" : ""} · $${order.total.toFixed(2)}`,
        duration: 6000,
      });
    };

    const handleStatusChange = (payload: {
      orderId: string;
      orderNumber: string;
      status: string;
    }) => {
      const terminalStatuses = ["delivered", "cancelled"];
      const activeStatuses = [
        "pending",
        "confirmed",
        "preparing",
        "out_for_delivery",
      ];

      queryClient.setQueryData<LiveOrder[]>(
        DASHBOARD_KEYS.liveOrders,
        (prev = []) => {
          if (terminalStatuses.includes(payload.status)) {
            // Show the final status briefly then remove after 3s
            const timer = setTimeout(() => {
              queryClient.setQueryData<LiveOrder[]>(
                DASHBOARD_KEYS.liveOrders,
                (current = []) =>
                  current.filter((o) => o._id !== payload.orderId),
              );
              removalTimers.current.delete(payload.orderId);
            }, 3000);

            removalTimers.current.set(payload.orderId, timer);

            return prev.map((o) =>
              o._id === payload.orderId
                ? { ...o, status: payload.status as LiveOrder["status"] }
                : o,
            );
          }

          if (activeStatuses.includes(payload.status)) {
            return prev.map((o) =>
              o._id === payload.orderId
                ? { ...o, status: payload.status as LiveOrder["status"] }
                : o,
            );
          }

          return prev;
        },
      );

      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEYS.orderStatus });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEYS.today });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEYS.recentOrders });
    };

    socket.on("order:new", handleNewOrder);
    socket.on("order:status_changed", handleStatusChange);

    return () => {
      socket.off("order:new", handleNewOrder);
      socket.off("order:status_changed", handleStatusChange);

      removalTimers.current.forEach((timer) => clearTimeout(timer));
      removalTimers.current.clear();
    };
  }, [queryClient]);

  return { data: data ?? [], isLoading, error };
}

// ─── Row 4: Summary Cards ──────────────────────────────────────────────────────
export function useDashboardSummaryCards() {
  return useQuery({
    queryKey: DASHBOARD_KEYS.summaryCards,
    queryFn: dashboardAPI.getSummaryCards,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    refetchInterval: 2 * 60 * 1000,
  });
}

// ─── Row 5: Recent Orders ──────────────────────────────────────────────────────
export function useDashboardRecentOrders() {
  return useQuery({
    queryKey: DASHBOARD_KEYS.recentOrders,
    queryFn: dashboardAPI.getRecentOrders,
    staleTime: 30 * 1000,
    gcTime: 2 * 60 * 1000,
    retry: 2,
    refetchInterval: 60 * 1000,
  });
}
