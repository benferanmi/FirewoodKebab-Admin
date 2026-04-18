import { ShoppingBag, Clock, Calendar } from "lucide-react";
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
  Legend,
} from "recharts";
import { StatsCard } from "@/components/common/StatsCard";

interface OrdersReportTabProps {
  analyticsData: {
    orderAnalytics: any[];
    paymentMethods: any[];
  };
  reportData: any;
  period: "7d" | "30d" | "90d";
}

export default function OrdersReportTab({
  analyticsData,
  reportData,
  period,
}: OrdersReportTabProps) {
  if (!reportData) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading orders report...</p>
      </div>
    );
  }

  const {
    summary,
    statusBreakdown,
    hourlyBreakdown,
    dayOfWeekBreakdown,
    heatmap,
  } = reportData;

  // Transform hourly data for chart
  const hourlyChartData = hourlyBreakdown.map((h: any) => ({
    hour: `${String(h._id).padStart(2, "0")}:00`,
    orders: h.count,
    revenue: h.revenue,
  }));

  // Transform day of week data
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dayChartData = dayOfWeekBreakdown.map((d: any) => ({
    day: d.day || daysOfWeek[d._id - 1] || "Unknown", // Use 'day' field from backend or fallback
    orders: d.count,
    revenue: d.revenue,
  }));

  // Status breakdown for table
  const statusColors: { [key: string]: string } = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    preparing: "bg-purple-100 text-purple-800",
    out_for_delivery: "bg-cyan-100 text-cyan-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    failed: "bg-red-100 text-red-800",
  };

  // Create heatmap grid (7 rows for days, 24 columns for hours)
  const heatmapGrid = Array(7)
    .fill(null)
    .map(() => Array(24).fill(0));

  heatmap.forEach((cell: any) => {
    if (cell._id) {
      const hour = cell._id.hour;
      const day = cell._id.dayOfWeek - 1; // Convert to 0-indexed
      if (day >= 0 && day < 7 && hour >= 0 && hour < 24) {
        heatmapGrid[day][hour] = cell.count;
      }
    }
  });

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Total Orders"
          value={summary.totalOrders.toString()}
          change={0}
          icon={ShoppingBag}
        />
        <StatsCard
          title="Cancellation Rate"
          value={`${summary.cancellationRate}%`}
          change={0}
          icon={Calendar}
        />
        <StatsCard
          title="Busiest Hour"
          value={`${String(summary.busiestHour).padStart(2, "0")}:00`}
          change={0}
          icon={Clock}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Orders by Hour */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="mb-4 text-sm font-semibold">Orders by Hour of Day</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hourlyChartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                interval={2}
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
              <Bar
                dataKey="orders"
                fill="hsl(var(--info))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Orders by Day of Week */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="mb-4 text-sm font-semibold">Orders by Day of Week</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dayChartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="day"
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
              <Bar
                dataKey="orders"
                fill="hsl(var(--chart-2))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Order Status Breakdown - FIXED */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="mb-4 text-sm font-semibold">Order Status Breakdown</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {statusBreakdown.map((status: any, i: number) => (
            <div key={i} className="p-4 border border-border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    statusColors[status._id] || "bg-gray-100 text-gray-800"
                  }`}
                >
                  {status._id.replace(/_/g, " ").toUpperCase()}
                </span>
              </div>
              <div className="text-2xl font-bold">{status.count}</div>
              {/* FIXED: Display avgTime instead of undefined total */}
              {/* avgTime is in minutes, from createdAt to actualDeliveryTime */}
              <div className="text-xs text-muted-foreground">
                {status.avgTime !== null && status.avgTime !== undefined
                  ? `Avg: ${status.avgTime.toFixed(1)} min`
                  : "Avg: N/A"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Peak Hours Heatmap */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="mb-4 text-sm font-semibold">
          Peak Hours Heatmap (Hour × Day of Week)
        </h3>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <table className="border-collapse text-xs">
              <thead>
                <tr>
                  <th className="p-2 text-left w-20">Day/Hour</th>
                  {Array.from({ length: 24 }, (_, i) => (
                    <th key={i} className="p-2 text-center w-8">
                      {String(i).padStart(2, "0")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {daysOfWeek.map((day, dayIdx) => (
                  <tr key={dayIdx}>
                    <td className="p-2 font-medium text-left">
                      {day.slice(0, 3)}
                    </td>
                    {heatmapGrid[dayIdx].map((count, hourIdx) => {
                      const intensity = Math.min(count / 10, 1);
                      return (
                        <td
                          key={hourIdx}
                          className="p-2 text-center border border-border"
                          style={{
                            backgroundColor: `rgba(59, 130, 246, ${intensity * 0.8})`,
                            color: intensity > 0.5 ? "white" : "black",
                          }}
                        >
                          {count > 0 ? count : "-"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
