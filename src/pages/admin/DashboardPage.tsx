import {
  ShoppingBag,
  DollarSign,
  Clock,
  Users,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { StatsCard } from "@/components/common/StatsCard";
import { OrderStatusBadge } from "@/components/common/StatusBadge";
import {
  useDashboardSummary,
  useDashboardRevenue,
  useDashboardTopItems,
} from "@/hooks/useDashboard";
import { useOrders } from "@/hooks/useOrders";

export default function DashboardPage() {
  const { data: summary } = useDashboardSummary();
  const { data: revenue } = useDashboardRevenue();
  const { data: topItems } = useDashboardTopItems();
  const { data: ordersData } = useOrders({ limit: 5 });

  console.log("Dashboard Summary:", revenue);
  const recentOrders = ordersData?.data?.slice(0, 5) || [];
  const chartRevenue = revenue || [];
  const chartTopItems = topItems || [];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={`Orders ${summary?.period}`}
          value={String(summary?.totalOrders ?? 0)}
          change={12.5}
          icon={ShoppingBag}
        />
        <StatsCard
          title={`Revenue ${summary?.period}`}
          value={`$${((summary?.totalRevenue ?? 0) / 1000).toFixed(0)}k`}
          change={8.3}
          icon={DollarSign}
        />
        <StatsCard
          title="Pending Orders"
          value={String(summary?.pendingOrders ?? 0)}
          icon={Clock}
          iconColor="bg-warning/10"
        />
        <StatsCard
          title="New Customers"
          value={String(summary?.newCustomers ?? 0)}
          change={-3.1}
          icon={Users}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card rounded-xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              Revenue Trend
            </h3>
            <span className="flex items-center gap-1 text-xs text-success font-medium">
              <TrendingUp className="h-3 w-3" /> +18.2%
            </span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartRevenue}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value: number) => [
                  `$${value.toLocaleString()}`,
                  "Revenue",
                ]}
              />
              <Bar
                dataKey="revenue"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* <div className="glass-card rounded-xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              Order Trend
            </h3>
            <span className="text-xs text-muted-foreground">This week</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={orderTrendData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="hsl(var(--info))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--info))", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div> */}
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="glass-card rounded-xl p-5 lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            Top Selling Items
          </h3>
          <div className="space-y-3">
            {chartTopItems.map((item, i) => (
              <div key={item.name} className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {item.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {item.totalQuantity} sold
                  </p>
                </div>
                <span className="text-sm font-semibold text-foreground font-mono">
                  ${(item.totalRevenue / 1000).toFixed(0)}k
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-xl p-5 lg:col-span-3">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            Recent Orders
          </h3>
          <div className="space-y-2">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center gap-4 rounded-lg p-2.5 hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-medium text-foreground">
                      {order.orderNumber}
                    </span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {order.customerName}
                  </p>
                </div>
                <span className="text-sm font-semibold text-foreground font-mono">
                  ${order.total.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
