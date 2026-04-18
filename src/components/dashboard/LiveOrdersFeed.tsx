import { useState } from "react";
import { Wifi, WifiOff, ChevronDown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useLiveOrders } from "@/hooks/useDashboard";
import { useUpdateOrderStatus } from "@/hooks/useOrders";
import { LiveOrder } from "@/services/api/dashboard";
import { isAdminSocketConnected } from "@/hooks/useSocket";
import { OrderStatus } from "@/types/admin";

const STATUS_TRANSITIONS: Record<string, { label: string; next: string }[]> = {
  pending: [{ label: "Confirm", next: "confirmed" }],
  confirmed: [{ label: "Start Preparing", next: "preparing" }],
  preparing: [{ label: "Out for Delivery", next: "out_for_delivery" }],
  out_for_delivery: [{ label: "Mark Delivered", next: "delivered" }],
};

const STATUS_BADGE: Record<string, string> = {
  pending:
    "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20",
  confirmed:
    "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20",
  preparing:
    "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20",
  out_for_delivery:
    "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20",
  delivered:
    "bg-green-500/15 text-green-600 dark:text-green-400 border border-green-500/20",
  cancelled:
    "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function LiveOrderRow({ order }: { order: LiveOrder }) {
  const [open, setOpen] = useState(false);
  const { mutate: updateStatus, isPending } = useUpdateOrderStatus();

  const transitions = STATUS_TRANSITIONS[order.status] ?? [];

  return (
    <div className="flex items-center gap-4 rounded-lg px-3 py-3 hover:bg-muted/40 transition-colors group">
      {/* Order info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono font-semibold text-foreground">
            #{order.orderNumber}
          </span>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_BADGE[order.status] ?? ""}`}
          >
            {STATUS_LABELS[order.status] ?? order.status}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">
          {order.customerName} ·{" "}
          {order.itemsCount === 1
            ? "1 item"
            : `${order.itemsCount} items`}
        </p>
      </div>

      {/* Total */}
      <span className="text-sm font-semibold font-mono text-foreground flex-shrink-0">
        ${order.total.toFixed(2)}
      </span>

      {/* Time */}
      <span className="text-[11px] text-muted-foreground flex-shrink-0 hidden sm:block">
        {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
      </span>

      {/* Inline status action */}
      {transitions.length > 0 && (
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setOpen((p) => !p)}
            disabled={isPending}
            className="inline-flex items-center gap-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
          >
            {isPending ? "Updating…" : "Update"}
            <ChevronDown className="h-3 w-3" />
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-1 z-20 min-w-[150px] rounded-lg border border-border bg-card shadow-lg overflow-hidden">
              {transitions.map((t) => (
                <button
                  key={t.next}
                  onClick={() => {
                    updateStatus(
                      { id: order._id, data: { status: t.next as OrderStatus } },
                      { onSettled: () => setOpen(false) },
                    );
                  }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-muted transition-colors"
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function LiveOrdersFeed() {
  const { data: orders, isLoading } = useLiveOrders();
  const connected = isAdminSocketConnected();

  return (
    <div className="glass-card rounded-xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Live Orders
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Active orders — updates in real time
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {connected ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-[11px] text-green-500 font-medium">
                Live
              </span>
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">
                Disconnected
              </span>
            </>
          )}
        </div>
      </div>

      {/* Orders */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-14 rounded-lg bg-muted/50 animate-pulse"
            />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Wifi className="h-8 w-8 text-muted-foreground/30 mb-2" />
          <p className="text-sm font-medium text-muted-foreground">
            No active orders
          </p>
          <p className="text-xs text-muted-foreground/70 mt-0.5">
            New orders will appear here automatically
          </p>
        </div>
      ) : (
        <div className="space-y-0.5 divide-y divide-border/40">
          {orders.map((order) => (
            <LiveOrderRow key={order._id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}