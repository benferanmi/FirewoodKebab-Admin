import { Percent, Gift, TrendingDown } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { StatsCard } from "@/components/common/StatsCard";
import { Badge } from "@/components/ui/badge";

interface DiscountsReportTabProps {
  reportData: any;
  period: "7d" | "30d" | "90d";
}

export default function DiscountsReportTab({
  reportData,
  period,
}: DiscountsReportTabProps) {
  if (!reportData) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading discounts report...</p>
      </div>
    );
  }

  const { summary, couponStats, loyaltyStats } = reportData;

  // Chart data
  const couponChartData = couponStats
    .slice(0, 10)
    .map((coupon: any) => ({
      name: coupon._id || "Unknown",
      usageCount: coupon.usageCount,
      discount: coupon.totalDiscount,
    }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Discounts Given"
          value={`$${(summary.totalDiscountGiven).toFixed(1)}`}
          change={0}
          icon={Percent}
        />
        <StatsCard
          title="Orders with Discount"
          value={summary.ordersWithDiscount.toString()}
          change={0}
          icon={Gift}
        />
        <StatsCard
          title="Discount % of Revenue"
          value={summary.discountPercentageOfRevenue}
          change={0}
          icon={TrendingDown}
        />
        <StatsCard
          title="Avg Discount per Order"
          value={`$${summary.averageDiscount}`}
          change={0}
          icon={Percent}
        />
      </div>

      {/* Top Coupons */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card rounded-xl p-5">
          <h3 className="mb-4 text-sm font-semibold">Most Used Coupons</h3>
          <div className="space-y-3">
            {couponStats.slice(0, 5).map((coupon: any, i: number) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded border border-border hover:bg-muted/50"
              >
                <div>
                  <p className="text-sm font-medium font-mono">
                    {coupon._id || "N/A"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {coupon.usageCount} uses
                  </p>
                </div>
                <Badge variant="secondary" className="font-mono">
                  ${coupon.totalDiscount.toLocaleString("en-US", {
                    maximumFractionDigits: 2,
                  })}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-xl p-5">
          <h3 className="mb-4 text-sm font-semibold">Discount Impact</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-1">
                Total Discount Value
              </p>
              <p className="text-2xl font-bold text-red-600">
                -${summary.totalDiscountGiven.toLocaleString("en-US", {
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {summary.discountPercentageOfRevenue}% of total revenue
              </p>
            </div>
            <div className="p-4 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-1">
                Avg Discount Value
              </p>
              <p className="text-2xl font-bold">
                ${summary.averageDiscount}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Per discounted order
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Coupon Usage Chart */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="mb-4 text-sm font-semibold">Top 10 Coupons by Usage</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={couponChartData} margin={{ left: 120 }} layout="vertical">
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
              width={110}
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
              dataKey="usageCount"
              fill="hsl(var(--chart-1))"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* All Coupons Table */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="mb-4 text-sm font-semibold">All Coupon Codes</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-2">Coupon Code</th>
                <th className="text-right py-2 px-2">Usage Count</th>
                <th className="text-right py-2 px-2">Total Discount</th>
                <th className="text-right py-2 px-2">Revenue Generated</th>
                <th className="text-right py-2 px-2">Avg Discount/Use</th>
              </tr>
            </thead>
            <tbody>
              {couponStats.map((coupon: any, i: number) => (
                <tr key={i} className="border-b border-border hover:bg-muted/50">
                  <td className="py-2 px-2 font-mono font-medium">
                    {coupon._id || "N/A"}
                  </td>
                  <td className="text-right py-2 px-2">{coupon.usageCount}</td>
                  <td className="text-right py-2 px-2">
                    ${coupon.totalDiscount.toLocaleString("en-US", {
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="text-right py-2 px-2">
                    ${coupon.revenue.toLocaleString("en-US", {
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="text-right py-2 px-2">
                    ${(coupon.totalDiscount / coupon.usageCount).toLocaleString(
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

      {/* Loyalty Points (if available) */}
      {loyaltyStats && loyaltyStats.totalRedeemedValue > 0 && (
        <div className="glass-card rounded-xl p-5 border border-blue-200 bg-blue-50">
          <div className="flex items-center gap-2 mb-4">
            <Gift className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-semibold text-blue-900">
              Loyalty Points Redeemed
            </h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="p-4 rounded-lg bg-white border border-blue-200">
              <p className="text-xs text-blue-600 mb-1">Total Redeemed Value</p>
              <p className="text-2xl font-bold">
                ${loyaltyStats.totalRedeemedValue.toLocaleString("en-US", {
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-white border border-blue-200">
              <p className="text-xs text-blue-600 mb-1">Orders Using Loyalty</p>
              <p className="text-2xl font-bold">
                {loyaltyStats.ordersUsingDiscount}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}