import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useDashboardRecentOrders } from "@/hooks/useDashboard";

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
  failed:
    "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  failed: "Failed",
};

export function RecentOrdersTable() {
  const navigate = useNavigate();
  const { data: orders, isLoading } = useDashboardRecentOrders();

  return (
    <div className="glass-card rounded-xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Recent Orders
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Last 10 orders overall
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/orders")}
          className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
        >
          View all
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border/60">
              <th className="text-left py-2 px-1 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Order
              </th>
              <th className="text-left py-2 px-1 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Customer
              </th>
              <th className="text-center py-2 px-1 text-[11px] font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                Items
              </th>
              <th className="text-right py-2 px-1 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Total
              </th>
              <th className="text-center py-2 px-1 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="text-right py-2 px-1 text-[11px] font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                Time
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {isLoading
              ? [...Array(10)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="py-3 px-1">
                        <div className="h-4 bg-muted/60 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              : (orders ?? []).map((order) => (
                  <tr
                    key={order._id}
                    onClick={() => navigate(`/admin/orders/${order._id}`)}
                    className="hover:bg-muted/40 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-1">
                      <span className="font-mono font-medium text-foreground">
                        #{order.orderNumber}
                      </span>
                    </td>
                    <td className="py-3 px-1">
                      <span className="text-foreground truncate max-w-[120px] block">
                        {order.customerName}
                      </span>
                    </td>
                    <td className="py-3 px-1 text-center text-muted-foreground hidden sm:table-cell">
                      {order.itemsCount}
                    </td>
                    <td className="py-3 px-1 text-right font-mono font-semibold text-foreground">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="py-3 px-1 text-center">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          STATUS_BADGE[order.status] ?? ""
                        }`}
                      >
                        {STATUS_LABELS[order.status] ?? order.status}
                      </span>
                    </td>
                    <td className="py-3 px-1 text-right text-muted-foreground hidden md:table-cell">
                      {formatDistanceToNow(new Date(order.createdAt), {
                        addSuffix: true,
                      })}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>

        {!isLoading && (orders ?? []).length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8">
            No orders yet
          </p>
        )}
      </div>
    </div>
  );
}