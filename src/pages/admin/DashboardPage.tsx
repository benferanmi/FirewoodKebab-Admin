import { LiveOrdersFeed } from "@/components/dashboard/LiveOrdersFeed";
import { OrderStatusOverview } from "@/components/dashboard/OrderStatusOverview";
import { RecentOrdersTable } from "@/components/dashboard/RecentOrdersTable";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { TodaySnapshot } from "@/components/dashboard/TodaySnapshot";


export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Row 1 — Today's Snapshot */}
      <TodaySnapshot />

      {/* Row 2 — Order Status Overview */}
      <OrderStatusOverview />

      {/* Row 3 — Live Orders Feed */}
      <LiveOrdersFeed />

      {/* Row 4 — Summary Cards */}
      <SummaryCards />

      {/* Row 5 — Recent Orders Table */}
      <RecentOrdersTable />
    </div>
  );
}
