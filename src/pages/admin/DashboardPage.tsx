import { useState, useMemo } from "react";
import {
  ShoppingBag,
  DollarSign,
  Clock,
  Users,
  TrendingUp,
  Filter,
  Calendar,
  BarChart3,
  AlertCircle,
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
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { StatsCard } from "@/components/common/StatsCard";
import { OrderStatusBadge } from "@/components/common/StatusBadge";
import {
  useDashboardSummary,
  useDashboardRevenue,
  useDashboardTopItems,
  useDashboardOrderStats,
  useDashboardPaymentStats,
} from "@/hooks/useDashboard";
import { useOrders } from "@/hooks/useOrders";

type PeriodType = "today" | "7d" | "30d" | "90d" | "month" | "custom";
type RevenueBreakdown = "category" | "paymentMethod" | "status";

const PERIOD_OPTIONS: { label: string; value: PeriodType }[] = [
  { label: "Today", value: "today" },
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 90 days", value: "90d" },
  { label: "This month", value: "month" },
  { label: "Custom range", value: "custom" },
];

const REVENUE_BREAKDOWN: { label: string; value: RevenueBreakdown }[] = [
  { label: "By Category", value: "category" },
  { label: "By Payment Method", value: "paymentMethod" },
  { label: "By Order Status", value: "status" },
];

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#14b8a6",
  "#f97316",
  "#6366f1",
];

const STATUS_DISPLAY_NAMES: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  failed: "Failed",
};

export default function DashboardPage() {
  const [period, setPeriod] = useState<PeriodType>("30d");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [breakdown, setBreakdown] = useState<RevenueBreakdown>("category");
  const [topItemsLimit, setTopItemsLimit] = useState(10);

  // Resolve actual dates
  const getDateRange = () => {
    if (period === "custom" && dateRange.startDate && dateRange.endDate) {
      return {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      };
    }

    const now = new Date();
    let start = new Date();

    switch (period) {
      case "today":
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "7d":
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    return {
      startDate: start.toISOString().split("T")[0],
      endDate: now.toISOString().split("T")[0],
    };
  };

  const dates = getDateRange();

  // Queries
  const { data: summary, isLoading: summaryLoading } =
    useDashboardSummary(period);
  const { data: revenue, isLoading: revenueLoading } = useDashboardRevenue({
    ...dates,
    breakdown,
  });
  const { data: topItems, isLoading: topItemsLoading } = useDashboardTopItems({
    limit: topItemsLimit,
    period,
  });
  const { data: orderStats, isLoading: orderStatsLoading } =
    useDashboardOrderStats(dates);
  const { data: paymentStats, isLoading: paymentStatsLoading } =
    useDashboardPaymentStats(dates);
  const { data: ordersData } = useOrders({ limit: 5 });

  const recentOrders = ordersData?.data?.slice(0, 5) || [];

  // Process chart revenue data - ensure correct structure
  const chartRevenue = useMemo(() => {
    if (!revenue || !Array.isArray(revenue)) return [];

    // For pie charts (paymentMethod, status), ensure we have _id and total
    if (breakdown === "paymentMethod" || breakdown === "status") {
      return revenue.map((item) => ({
        _id: item._id || "Unknown",
        total: item.total || 0,
        count: item.count || 0,
      }));
    }

    // For bar charts (category), ensure we have _id and total
    return revenue.map((item) => ({
      _id: item._id || "Unknown",
      total: item.revenue || 0,
      count: item.count || 0,
    }));
  }, [revenue, breakdown]);

  // Process top items - ensure correct structure and formatting
  const chartTopItems = useMemo(() => {
    if (!topItems || !Array.isArray(topItems)) return [];

    return topItems.map((item) => ({
      _id: item._id,
      name: item.name || "Unknown",
      totalQuantity: item.totalQuantity || 0,
      totalRevenue: item.totalRevenue || 0,
    }));
  }, [topItems]);

  // Process order stats - create cards for all statuses
  const orderStatusCards = useMemo(() => {
    if (!orderStats || !Array.isArray(orderStats)) return [];

    return orderStats.map((stat) => ({
      status: stat.status || stat._id || "unknown",
      count: stat.count || 0,
      total: stat.total || 0,
    }));
  }, [orderStats]);

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="glass-card rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Filters</h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Period Selector */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">
              <Calendar className="h-3 w-3 inline mr-1" />
              Period
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as PeriodType)}
              className="w-full px-3 py-2 rounded-lg bg-muted text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {PERIOD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date - Always visible, but disabled when not custom */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={period === "custom" ? dateRange.startDate : ""}
              onChange={(e) =>
                setDateRange({ ...dateRange, startDate: e.target.value })
              }
              disabled={period !== "custom"}
              className="w-full px-3 py-2 rounded-lg bg-muted text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* End Date - Always visible, but disabled when not custom */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">
              End Date
            </label>
            <input
              type="date"
              value={period === "custom" ? dateRange.endDate : ""}
              onChange={(e) =>
                setDateRange({ ...dateRange, endDate: e.target.value })
              }
              disabled={period !== "custom"}
              className="w-full px-3 py-2 rounded-lg bg-muted text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Revenue Breakdown */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">
              <BarChart3 className="h-3 w-3 inline mr-1" />
              Revenue Breakdown
            </label>
            <select
              value={breakdown}
              onChange={(e) => setBreakdown(e.target.value as RevenueBreakdown)}
              className="w-full px-3 py-2 rounded-lg bg-muted text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {REVENUE_BREAKDOWN.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Top Items Limit */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">
              Top Items Limit
            </label>
            <input
              type="number"
              min="5"
              max="50"
              value={topItemsLimit}
              onChange={(e) => setTopItemsLimit(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-muted text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
      </div>

      {/* Stats - Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Orders"
          value={String(summary?.totalOrders ?? 0)}
          change={summary?.orderChange}
          icon={ShoppingBag}
          isLoading={summaryLoading}
        />
        <StatsCard
          title="Total Revenue"
          value={`$${((summary?.totalRevenue ?? 0) ).toFixed(1)}`}
          change={summary?.revenueChange}
          icon={DollarSign}
          isLoading={summaryLoading}
        />
        <StatsCard
          title="Avg Order Value"
          value={`$${((summary?.averageOrderValue ?? 0) / 100).toFixed(0)}`}
          icon={TrendingUp}
          isLoading={summaryLoading}
        />
        <StatsCard
          title="New Customers"
          value={String(summary?.newCustomers ?? 0)}
          change={summary?.customerChange}
          icon={Users}
          isLoading={summaryLoading}
        />
      </div>

      {/* Order Status Cards Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {orderStatsLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="glass-card rounded-xl p-5 stat-gradient h-24 bg-muted/50 animate-pulse"
              />
            ))}
          </>
        ) : orderStatusCards.length > 0 ? (
          orderStatusCards.map((stat) => (
            <div
              key={stat.status}
              className="glass-card rounded-xl p-5 stat-gradient"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {STATUS_DISPLAY_NAMES[stat.status] || stat.status}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {stat.count}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ${(stat.total ).toFixed(1)}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-4 text-center py-4 text-xs text-muted-foreground">
            No order data available
          </div>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Trend / Breakdown */}
        <div className="glass-card rounded-xl p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              Revenue{" "}
              {breakdown === "category"
                ? "by Category"
                : breakdown === "paymentMethod"
                  ? "by Payment Method"
                  : "by Status"}
            </h3>
            <span className="flex items-center gap-1 text-xs text-success font-medium">
              <TrendingUp className="h-3 w-3" /> {summary?.revenueChange || 0}%
            </span>
          </div>

          {revenueLoading ? (
            <div className="h-80 flex items-center justify-center">
              <div className="text-center">
                <div className="h-8 w-8 rounded-full border-2 border-muted border-t-primary animate-spin mx-auto mb-2"></div>
                <p className="text-xs text-muted-foreground">
                  Loading chart...
                </p>
              </div>
            </div>
          ) : chartRevenue.length === 0 ? (
            <div className="h-80 flex items-center justify-center">
              <div className="text-center">
                <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-xs text-muted-foreground">
                  No revenue data available
                </p>
              </div>
            </div>
          ) : breakdown === "paymentMethod" || breakdown === "status" ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartRevenue}
                  dataKey="total"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ _id, total }) =>
                    `${_id}: $${(total ).toFixed(0)}`
                  }
                  labelLine={false}
                >
                  {chartRevenue.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) =>
                    `$${(value ).toFixed(1)}`
                  }
                  labelFormatter={(label) => `${label}`}
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartRevenue}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="_id"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${(v ).toFixed(0)}`}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(value: number) => [
                    `$${(value).toFixed(1)}`,
                    "Revenue",
                  ]}
                  labelFormatter={(label) => `${label}`}
                />
                <Bar
                  dataKey="total"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Payment Methods */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            Payment Methods
          </h3>

          {paymentStatsLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-12 bg-muted/50 rounded animate-pulse"
                />
              ))}
            </div>
          ) : paymentStats && paymentStats.length > 0 ? (
            <div className="space-y-3">
              {paymentStats.map((method, i) => (
                <div key={method._id} className="flex items-center gap-3">
                  <div
                    className="h-3 w-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground capitalize">
                      {method._id}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {method.count} transactions
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-semibold text-foreground font-mono">
                      ${(method.total ).toFixed(1)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {method.percentage}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-muted-foreground">
              No payment data available
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Top Selling Items */}
        <div className="glass-card rounded-xl p-5 lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            Top Selling Items
          </h3>

          {topItemsLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-10 bg-muted/50 rounded animate-pulse"
                />
              ))}
            </div>
          ) : chartTopItems.length > 0 ? (
            <div className="space-y-3">
              {chartTopItems.map((item, i) => (
                <div key={item._id} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary flex-shrink-0">
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
                  <span className="text-sm font-semibold text-foreground font-mono flex-shrink-0">
                    ${(item.totalRevenue ).toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-8">
              No items data available
            </p>
          )}
        </div>

        {/* Recent Orders */}
        <div className="glass-card rounded-xl p-5 lg:col-span-3">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            Recent Orders
          </h3>
          <div className="space-y-2">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div
                  key={order._id}
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
                      {order.userId.firstName ||
                        order.userId.lastName ||
                        order.guestName ||
                        "Guest"}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-foreground font-mono flex-shrink-0">
                    ${order.total.toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground text-center py-8">
                No recent orders
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
