import { usePaymentsOverview } from "@/hooks/usePayments";
import { DollarSign, ShoppingBag, AlertTriangle, Clock } from "lucide-react";

export default function OverviewTab() {
  const { data, isLoading } = usePaymentsOverview();

  const stats = [
    {
      label: "Today's Revenue",
      value: `$${((data?.todayRevenue || 0) / 100).toFixed(2)}`,
      icon: DollarSign,
      color: "text-green-500",
    },
    {
      label: "Transactions Today",
      value: data?.todayTransactions || 0,
      icon: ShoppingBag,
      color: "text-blue-500",
    },
    {
      label: "Failed Payments",
      value: data?.failedCount || 0,
      icon: AlertTriangle,
      color: "text-red-500",
    },
    {
      label: "Pending Amount",
      value: `$${((data?.pendingAmount || 0) / 100).toFixed(2)}`,
      icon: Clock,
      color: "text-yellow-500",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="glass-card rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </div>
            <p className="text-xl font-bold">{isLoading ? "—" : s.value}</p>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-xl p-4">
        <h3 className="text-sm font-semibold mb-3">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 font-medium text-muted-foreground">
                  Order
                </th>
                <th className="text-left py-2 font-medium text-muted-foreground">
                  Customer
                </th>
                <th className="text-left py-2 font-medium text-muted-foreground">
                  Amount
                </th>
                <th className="text-left py-2 font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-left py-2 font-medium text-muted-foreground">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {data?.recentTransactions?.map((t: any) => (
                <tr
                  key={t.id}
                  className="border-b border-border/50 hover:bg-muted/20"
                >
                  <td className="py-2 font-mono">{t.orderNumber}</td>
                  <td className="py-2">{t.customer}</td>
                  <td className="py-2">${(t.amount / 100).toFixed(2)}</td>
                  <td className="py-2">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="py-2 text-muted-foreground">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isLoading && !data?.recentTransactions?.length && (
            <p className="text-center text-xs text-muted-foreground py-6">
              No transactions yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    successful: "bg-green-500/10 text-green-600",
    pending: "bg-yellow-500/10 text-yellow-600",
    failed: "bg-red-500/10 text-red-600",
    refunded: "bg-blue-500/10 text-blue-600",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${map[status] || "bg-muted text-muted-foreground"}`}
    >
      {status}
    </span>
  );
}

export { StatusBadge };
