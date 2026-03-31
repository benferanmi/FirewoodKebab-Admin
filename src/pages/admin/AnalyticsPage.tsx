import { ShoppingBag, DollarSign, Users, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { StatsCard } from "@/components/common/StatsCard";
import { Button } from "@/components/ui/button";
import { useFiltersStore } from "@/store/filtersStore";
import {
  useRevenueAnalytics,
  useOrderAnalytics,
  usePaymentMethodAnalytics,
  useItemsPerformance,
  useCustomerAnalytics,
} from "@/hooks/useAnalytics";

export default function AnalyticsPage() {
  const { analyticsFilters, setAnalyticsFilters } = useFiltersStore();

  const { data: revenueBreakdown = [] } = useRevenueAnalytics({
    period: analyticsFilters.period,
  });
  const { data: orderAnalytics = [] } = useOrderAnalytics({
    period: analyticsFilters.period,
  });
  const { data: paymentMethods = [] } = usePaymentMethodAnalytics({
    period: analyticsFilters.period,
  });
  const { data: itemsPerformance = [] } = useItemsPerformance({
    period: analyticsFilters.period,
  });
  const { data: customerStats } = useCustomerAnalytics({
    period: analyticsFilters.period,
  });

  // Transform backend data for charts
  const chartRevenue = revenueBreakdown.map((d) => ({
    date: d._id,
    revenue: d.total,
  }));

  const chartOrders = orderAnalytics.map((d) => ({
    date: d._id,
    orders: d.totalOrders,
    revenue: d.totalRevenue,
  }));

  const chartTopItems = itemsPerformance.map((d) => ({
    name: d.name,
    revenue: d.totalRevenue,
    quantity: d.totalQuantity,
  }));

  const paymentMethodData = paymentMethods.map((d, i) => ({
    name: d._id,
    value: d.count,
    color: `hsl(var(--chart-${(i % 4) + 1}))`,
  }));

  // Calculate total values from analytics data
  const totalOrders = orderAnalytics.reduce((sum, d) => sum + d.totalOrders, 0);
  const totalRevenue = orderAnalytics.reduce(
    (sum, d) => sum + d.totalRevenue,
    0,
  );
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const uniqueCustomers = customerStats?.totalCustomers || 0;
 
  // Calculate percentage changes (you may want to compare with previous period)
  const orderChange = 12.5; // TODO: Calculate from previous period
  const revenueChange = 18.2; // TODO: Calculate from previous period
  const avgOrderChange = 3.1; // TODO: Calculate from previous period
  const customerChange = 7.4; // TODO: Calculate from previous period
 
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(["7d", "30d", "90d"] as const).map((period) => (
            <Button
              key={period}
              variant={
                analyticsFilters.period === period ? "secondary" : "ghost"
              } 
              size="sm"
              className="text-xs h-8"
              onClick={() => setAnalyticsFilters({ period })}
            >
              {period === "7d"
                ? "7 Days"
                : period === "30d"
                  ? "30 Days"
                  : "90 Days"}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Orders"
          value={totalOrders.toString()}
          change={orderChange}
          icon={ShoppingBag}
        />
        <StatsCard
          title="Total Revenue"
          value={`$${(totalRevenue / 1000000).toFixed(2)}`}
          change={revenueChange}
          icon={DollarSign}
        />
        <StatsCard
          title="Avg Order Value"
          value={`$${avgOrderValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}`}
          change={avgOrderChange}
          icon={TrendingUp}
        />
        <StatsCard
          title="Unique Customers"
          value={uniqueCustomers.toString()}
          change={customerChange}
          icon={Users}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card rounded-xl p-5">
          <h3 className="mb-4 text-sm font-semibold">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={260}>
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
                formatter={(v: number) => [`$${v.toLocaleString()}`, "Revenue"]}
              />
              <Bar
                dataKey="revenue"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card rounded-xl p-5">
          <h3 className="mb-4 text-sm font-semibold">Order Trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartOrders}>
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
                formatter={(v: number) => [v.toString(), "Orders"]}
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
        </div>

        <div className="glass-card rounded-xl p-5">
          <h3 className="mb-4 text-sm font-semibold">Payment Methods</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={paymentMethodData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
              >
                {paymentMethodData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(v: number) => [v.toString(), "Count"]}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card rounded-xl p-5">
          <h3 className="mb-4 text-sm font-semibold">Top Items by Revenue</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartTopItems} layout="vertical">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(v: number) => [`$${v.toLocaleString()}`, "Revenue"]}
              />
              <Bar
                dataKey="revenue"
                fill="hsl(var(--chart-4))"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
