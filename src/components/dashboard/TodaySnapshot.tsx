import { DollarSign, ShoppingBag, Users, Clock } from "lucide-react";
import { useDashboardToday } from "@/hooks/useDashboard";

function StatCard({
  title,
  value,
  icon: Icon,
  isLoading,
  urgent,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  isLoading: boolean;
  urgent?: boolean;
}) {
  return (
    <div
      className={`glass-card rounded-xl p-5 stat-gradient flex items-start justify-between gap-4 ${
        urgent ? "ring-2 ring-amber-500/50 bg-amber-500/5" : ""
      }`}
    >
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </p>
        {isLoading ? (
          <div className="h-8 w-24 bg-muted/60 rounded animate-pulse" />
        ) : (
          <p
            className={`text-2xl font-bold ${urgent ? "text-amber-500" : "text-foreground"}`}
          >
            {value}
          </p>
        )}
      </div>
      <div
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
          urgent ? "bg-amber-500/15" : "bg-primary/10"
        }`}
      >
        <Icon
          className={`h-5 w-5 ${urgent ? "text-amber-500" : "text-primary"}`}
        />
      </div>
    </div>
  );
}

export function TodaySnapshot() {
  const { data, isLoading } = useDashboardToday();

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Today's Revenue"
        value={`$${(data?.totalRevenue ?? 0).toFixed(2)}`}
        icon={DollarSign}
        isLoading={isLoading}
      />
      <StatCard
        title="Today's Orders"
        value={String(data?.totalOrders ?? 0)}
        icon={ShoppingBag}
        isLoading={isLoading}
      />
      <StatCard
        title="New Customers"
        value={String(data?.newCustomers ?? 0)}
        icon={Users}
        isLoading={isLoading}
      />
      <StatCard
        title="Pending Orders"
        value={String(data?.pendingOrders ?? 0)}
        icon={Clock}
        isLoading={isLoading}
        urgent={(data?.pendingOrders ?? 0) > 0}
      />
    </div>
  );
}