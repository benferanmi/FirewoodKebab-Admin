import { ShoppingBag, DollarSign, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
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

interface SalesReportTabProps {
  analyticsData: {
    revenueBreakdown: any[];
    orderAnalytics: any[];
    paymentMethods: any[];
  };
  reportData: any;
  period: "7d" | "30d" | "90d";
}

export default function SalesReportTab({
  analyticsData,
  reportData,
  period,
}: SalesReportTabProps) {
  if (!reportData) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading sales report...</p>
      </div>
    );
  }

  const { summary, dailyBreakdown, categoryBreakdown } = reportData;

  // Transform data for charts
  const dailyChartData = dailyBreakdown.map((d: any) => ({
    date: d._id,
    revenue: d.revenue,
    orders: d.orders,
  }));

  const categoryChartData = categoryBreakdown.map((c: any, i: number) => ({
    name: c._id || "Other",
    value: c.revenue,
    color: `hsl(var(--chart-${(i % 4) + 1}))`,
  }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Total Revenue"
          value={`$${(summary.totalRevenue).toFixed(2)}`}
          change={summary.revenueChange}
          icon={DollarSign}
        />
        <StatsCard
          title="Total Orders"
          value={summary.totalOrders.toString()}
          change={0}
          icon={ShoppingBag}
        />
        <StatsCard
          title="Avg Order Value"
          value={`$${summary.averageOrderValue.toLocaleString("en-US", {
            maximumFractionDigits: 0,
          })}`}
          change={0}
          icon={TrendingUp}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Daily Revenue Breakdown */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="mb-4 text-sm font-semibold">Daily Revenue Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyChartData}>
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
                tickFormatter={(v) => `$${(v).toFixed(0)}`}
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

        {/* Revenue by Category */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="mb-4 text-sm font-semibold">
            Revenue Breakdown by Category
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryChartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
              >
                {categoryChartData.map((entry: any, i: number) => (
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
                formatter={(v: number) => [`$${v.toLocaleString()}`, "Revenue"]}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Details Table */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="mb-4 text-sm font-semibold">Category Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-2">Category</th>
                <th className="text-right py-2 px-2">Revenue</th>
                <th className="text-right py-2 px-2">Orders</th>
                <th className="text-right py-2 px-2">% of Total</th>
              </tr>
            </thead>
            <tbody>
              {categoryBreakdown.map((cat: any, i: number) => (
                <tr key={i} className="border-b border-border hover:bg-muted/50">
                  <td className="py-2 px-2">{cat._id || "Other"}</td>
                  <td className="text-right py-2 px-2">
                    ${cat.revenue.toLocaleString("en-US", {
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="text-right py-2 px-2">{cat.orders}</td>
                  <td className="text-right py-2 px-2">
                    {(
                      (cat.revenue / summary.totalRevenue) *
                      100
                    ).toFixed(1)}
                    %
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}