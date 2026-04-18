import { useNavigate } from "react-router-dom";
import { useDashboardOrderStatus } from "@/hooks/useDashboard";

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; ring: string }
> = {
  pending: {
    label: "Pending",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    ring: "hover:ring-amber-500/40",
  },
  confirmed: {
    label: "Confirmed",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    ring: "hover:ring-blue-500/40",
  },
  preparing: {
    label: "Preparing",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    ring: "hover:ring-purple-500/40",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    ring: "hover:ring-cyan-500/40",
  },
  delivered: {
    label: "Delivered Today",
    color: "text-green-500",
    bg: "bg-green-500/10",
    ring: "hover:ring-green-500/40",
  },
  cancelled: {
    label: "Cancelled Today",
    color: "text-red-500",
    bg: "bg-red-500/10",
    ring: "hover:ring-red-500/40",
  },
};

const STATUS_ORDER = [
  "pending",
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

export function OrderStatusOverview() {
  const navigate = useNavigate();
  const { data: statuses, isLoading } = useDashboardOrderStatus();

  // Normalize to a map for quick lookup
  const countMap = Object.fromEntries(
    (statuses ?? []).map((s) => [s.status, s.count]),
  );

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {STATUS_ORDER.map((s) => (
          <div
            key={s}
            className="glass-card rounded-xl p-4 h-24 bg-muted/50 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {STATUS_ORDER.map((status) => {
        const config = STATUS_CONFIG[status];
        const count = countMap[status] ?? 0;

        return (
          <button
            key={status}
            onClick={() =>
              navigate(`/admin/orders?status=${status}`)
            }
            className={`glass-card rounded-xl p-4 text-left transition-all duration-150 hover:ring-2 ${config.ring} cursor-pointer group`}
          >
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2 group-hover:text-foreground transition-colors">
              {config.label}
            </p>
            <p className={`text-2xl font-bold ${config.color}`}>{count}</p>
            <div
              className={`mt-2 h-1 w-8 rounded-full ${config.bg} ${config.color}`}
            />
          </button>
        );
      })}
    </div>
  );
}