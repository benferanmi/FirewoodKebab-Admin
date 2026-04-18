import { Users, TrendingUp, MapPin } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

interface CustomersReportTabProps {
  analyticsData: {
    customerStats?: any;
  };
  reportData: any;
  period: "7d" | "30d" | "90d";
}

export default function CustomersReportTab({
  analyticsData,
  reportData,
  period,
}: CustomersReportTabProps) {
  if (!reportData) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading customers report...</p>
      </div>
    );
  }

  const { summary, topCustomers, locationBreakdown } = reportData;

  // Chart data
  const newVsReturningData = [
    { name: "New Customers", value: summary.newCustomers, color: "hsl(var(--chart-1))" },
    {
      name: "Returning Customers",
      value: summary.returningCustomers,
      color: "hsl(var(--chart-2))",
    },
  ];

  const locationChartData = locationBreakdown
    .slice(0, 10)
    .map((loc: any) => ({
      name: loc._id || "Unknown",
      customers: loc.count,
      revenue: loc.revenue,
    }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="New Customers"
          value={summary.newCustomers.toString()}
          change={0}
          icon={Users}
        />
        <StatsCard
          title="Returning Customers"
          value={summary.returningCustomers.toString()}
          change={0}
          icon={TrendingUp}
        />
        <StatsCard
          title="Total Registered"
          value={summary.totalCustomers.toString()}
          change={0}
          icon={Users}
        />
        <StatsCard
          title="Retention Rate"
          value={`${summary.retentionRate}%`}
          change={0}
          icon={TrendingUp}
        />
      </div>

      {/* New vs Returning Customers */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card rounded-xl p-5">
          <h3 className="mb-4 text-sm font-semibold">
            New vs Returning Customers
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={newVsReturningData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
              >
                {newVsReturningData.map((entry, i) => (
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
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Cities by Orders */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="mb-4 text-sm font-semibold">Top Cities by Orders</h3>
          <div className="space-y-3">
            {locationChartData.slice(0, 6).map((loc: any, i: number) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{loc.name}</span>
                </div>
                <Badge variant="secondary">{loc.customers} orders</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Customers Table */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="mb-4 text-sm font-semibold">Top Customers by Spend</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-2">Name</th>
                <th className="text-left py-2 px-2">Email</th>
                <th className="text-right py-2 px-2">Total Spent</th>
                <th className="text-right py-2 px-2">Orders</th>
                <th className="text-right py-2 px-2">Avg Order</th>
              </tr>
            </thead>
            <tbody>
              {topCustomers.map((customer: any, i: number) => (
                <tr key={i} className="border-b border-border hover:bg-muted/50">
                  <td className="py-2 px-2 font-medium">{customer.name}</td>
                  <td className="py-2 px-2 text-muted-foreground">
                    {customer.email}
                  </td>
                  <td className="text-right py-2 px-2">
                    ${customer.totalSpent.toLocaleString("en-US", {
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="text-right py-2 px-2">{customer.orderCount}</td>
                  <td className="text-right py-2 px-2">
                    ${(customer.totalSpent / customer.orderCount).toLocaleString(
                      "en-US",
                      {
                        maximumFractionDigits: 2,
                      }
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Location Breakdown Chart */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="mb-4 text-sm font-semibold">Revenue by City</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={locationChartData}
            margin={{ left: 100 }}
            layout="vertical"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
            />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${(v).toFixed(0)}`}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              width={95}
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
              fill="hsl(var(--chart-3))"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}