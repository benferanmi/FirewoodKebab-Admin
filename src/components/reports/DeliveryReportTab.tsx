import { Truck, Package, MapPin, DollarSign } from "lucide-react";
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

interface DeliveryReportTabProps {
  reportData: any;
  period: "7d" | "30d" | "90d";
}

export default function DeliveryReportTab({
  reportData,
  period,
}: DeliveryReportTabProps) {
  if (!reportData) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading delivery report...</p>
      </div>
    );
  }

  const { summary, typeBreakdown, zoneBreakdown } = reportData;

  // Chart data
  const typeChartData = typeBreakdown.map((type: any) => ({
    name: type._id === "delivery" ? "Delivery" : "Pickup",
    count: type.count,
    revenue: type.revenue,
    color: type._id === "delivery" ? "hsl(var(--chart-1))" : "hsl(var(--chart-2))",
  }));

  const zoneChartData = zoneBreakdown
    .slice(0, 10)
    .map((zone: any) => ({
      name: zone._id || "Unknown Zone",
      orders: zone.count,
      revenue: zone.revenue,
      fees: zone.totalDeliveryFee,
    }));

  const deliveryTypeData = [
    {
      name: "Delivery",
      value: summary.deliveryOrders,
      color: "hsl(var(--chart-1))",
    },
    { name: "Pickup", value: summary.pickupOrders, color: "hsl(var(--chart-2))" },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Delivery Orders"
          value={summary.deliveryOrders.toString()}
          change={0}
          icon={Truck}
        />
        <StatsCard
          title="Pickup Orders"
          value={summary.pickupOrders.toString()}
          change={0}
          icon={Package}
        />
        <StatsCard
          title="Delivery %"
          value={`${summary.deliveryPercentage}%`}
          change={0}
          icon={MapPin}
        />
        <StatsCard
          title="Delivery Fee Revenue"
          value={`$${(summary.totalDeliveryFeeRevenue / 1000).toFixed(1)}k`}
          change={0}
          icon={DollarSign}
        />
      </div>

      {/* Delivery vs Pickup Pie Chart */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card rounded-xl p-5">
          <h3 className="mb-4 text-sm font-semibold">
            Delivery vs Pickup Orders
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={deliveryTypeData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
              >
                {deliveryTypeData.map((entry, i) => (
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

        {/* Free Delivery Stats */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="mb-4 text-sm font-semibold">Delivery Fee Breakdown</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-1">
                Total Delivery Fee Revenue
              </p>
              <p className="text-2xl font-bold text-green-600">
                ${summary.totalDeliveryFeeRevenue.toLocaleString("en-US", {
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="p-4 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-1">
                Free Delivery Orders
              </p>
              <p className="text-2xl font-bold">
                {summary.freeDeliveryOrders}
              </p>
              {summary.deliveryOrders > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {(
                    (summary.freeDeliveryOrders / summary.deliveryOrders) *
                    100
                  ).toFixed(1)}
                  % of deliveries
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Revenue by Type */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="mb-4 text-sm font-semibold">Revenue by Type</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={typeChartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
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
            />
            <Bar
              yAxisId="left"
              dataKey="count"
              fill="hsl(var(--chart-3))"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              yAxisId="right"
              dataKey="revenue"
              fill="hsl(var(--chart-4))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Zones Table */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="mb-4 text-sm font-semibold">Delivery Zones Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-2">Zone</th>
                <th className="text-right py-2 px-2">Orders</th>
                <th className="text-right py-2 px-2">Revenue</th>
                <th className="text-right py-2 px-2">Delivery Fees</th>
                <th className="text-right py-2 px-2">Avg Order</th>
              </tr>
            </thead>
            <tbody>
              {zoneChartData.map((zone: any, i: number) => (
                <tr key={i} className="border-b border-border hover:bg-muted/50">
                  <td className="py-2 px-2 font-medium">{zone.name}</td>
                  <td className="text-right py-2 px-2">{zone.orders}</td>
                  <td className="text-right py-2 px-2">
                    ${zone.revenue.toLocaleString("en-US", {
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="text-right py-2 px-2">
                    ${zone.fees.toLocaleString("en-US", {
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="text-right py-2 px-2">
                    ${(zone.revenue / zone.orders).toLocaleString("en-US", {
                      maximumFractionDigits: 2,
                    })}
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