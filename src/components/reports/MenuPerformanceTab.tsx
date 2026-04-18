import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Badge } from "@/components/ui/badge";

interface MenuPerformanceTabProps {
  analyticsData: {
    itemsPerformance: any[];
  };
  reportData: any;
  period: "7d" | "30d" | "90d";
}

export default function MenuPerformanceTab({
  analyticsData,
  reportData,
  period,
}: MenuPerformanceTabProps) {
  if (!reportData) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading menu performance report...</p>
      </div>
    );
  }

  const { bestItems, worstItems, deadStock, categoryPerformance } = reportData;

  // Transform data for charts
  const bestItemsChartData = bestItems.map((item: any) => ({
    name: item.name.length > 15 ? item.name.slice(0, 15) + "..." : item.name,
    revenue: item.revenue,
    quantity: item.quantity,
  }));

  const categoryChartData = categoryPerformance.map((cat: any) => ({
    name: cat._id || "Other",
    revenue: cat.revenue,
    items: cat.items,
  }));

  return (
    <div className="space-y-6">
      {/* Best vs Worst Items Overview */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <h3 className="text-sm font-semibold">Top Performers</h3>
          </div>
          <div className="space-y-2">
            {bestItems.slice(0, 5).map((item: any, i: number) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 rounded border border-border"
              >
                <span className="text-sm truncate font-medium">{item.name}</span>
                <span className="text-sm font-semibold text-green-600">
                  ${item.revenue.toLocaleString("en-US", {
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-5 h-5 text-red-500" />
            <h3 className="text-sm font-semibold">Underperformers</h3>
          </div>
          <div className="space-y-2">
            {worstItems.slice(0, 5).map((item: any, i: number) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 rounded border border-border"
              >
                <span className="text-sm truncate font-medium">{item.name}</span>
                <Badge variant="outline" className="text-xs">
                  {item.quantity} orders
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Best Items Chart */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="mb-4 text-sm font-semibold">Top 10 Items by Revenue</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={bestItemsChartData}
            layout="vertical"
            margin={{ left: 150 }}
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
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              width={140}
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
              fill="hsl(var(--chart-1))"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category Performance */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="mb-4 text-sm font-semibold">Category Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-2">Category</th>
                <th className="text-right py-2 px-2">Revenue</th>
                <th className="text-right py-2 px-2">Items Sold</th>
                <th className="text-right py-2 px-2">Avg per Item</th>
              </tr>
            </thead>
            <tbody>
              {categoryPerformance.map((cat: any, i: number) => (
                <tr key={i} className="border-b border-border hover:bg-muted/50">
                  <td className="py-2 px-2 font-medium">{cat._id || "Other"}</td>
                  <td className="text-right py-2 px-2">
                    ${cat.revenue.toLocaleString("en-US", {
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="text-right py-2 px-2">{cat.items}</td>
                  <td className="text-right py-2 px-2">
                    ${(cat.revenue / cat.items).toLocaleString("en-US", {
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dead Stock Warning */}
      {deadStock && deadStock.length > 0 && (
        <div className="glass-card rounded-xl p-5 border border-yellow-200 bg-yellow-50">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <h3 className="text-sm font-semibold text-yellow-900">
              Dead Stock Alert ({deadStock.length} items)
            </h3>
          </div>
          <p className="text-xs text-yellow-800 mb-3">
            These items were never ordered during this period. Consider
            discontinuing or promoting them.
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {deadStock.slice(0, 9).map((item: any, i: number) => (
              <div
                key={i}
                className="p-3 bg-white rounded border border-yellow-200 text-sm"
              >
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">No orders</p>
              </div>
            ))}
          </div>
          {deadStock.length > 9 && (
            <p className="text-xs text-yellow-800 mt-3">
              + {deadStock.length - 9} more items
            </p>
          )}
        </div>
      )}
    </div>
  );
}