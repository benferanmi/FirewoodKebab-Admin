import { useState } from "react";
import { useTransactions } from "@/hooks/usePayments";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "./OverviewTab";
import { Search, Download } from "lucide-react";
import { paymentsAPI } from "@/services/api/payments";
import { toast } from "sonner";

export default function TransactionsTab() {
  const [filters, setFilters] = useState({ page: 1, limit: 20, status: "", search: "", startDate: "", endDate: "" });
  const [selected, setSelected] = useState<any>(null);
  const { data, isLoading } = useTransactions(filters);

  const handleExport = async () => {
    try {
      const blob = await paymentsAPI.exportTransactions(filters);
      const url = URL.createObjectURL(new Blob([blob]));
      const a = document.createElement("a"); a.href = url; a.download = "transactions.csv"; a.click();
    } catch { toast.error("Export failed"); }
  };

  return (
    <div className="space-y-4">
      <div className="glass-card rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search order or customer..." className="pl-8 h-9 text-xs"
              value={filters.search} onChange={e => setFilters(p => ({ ...p, search: e.target.value, page: 1 }))} />
          </div>
          <Select value={filters.status} onValueChange={v => setFilters(p => ({ ...p, status: v, page: 1 }))}>
            <SelectTrigger className="w-36 h-9 text-xs"><SelectValue placeholder="All statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              <SelectItem value="successful">Successful</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
          <Input type="date" className="h-9 text-xs w-36" value={filters.startDate}
            onChange={e => setFilters(p => ({ ...p, startDate: e.target.value }))} />
          <Input type="date" className="h-9 text-xs w-36" value={filters.endDate}
            onChange={e => setFilters(p => ({ ...p, endDate: e.target.value }))} />
          <Button size="sm" variant="outline" onClick={handleExport} className="h-9 text-xs gap-1.5">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                {["Order", "Customer", "Amount", "Method", "Status", "Date"].map(h => (
                  <th key={h} className="text-left py-2 font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.transactions?.map((t: any) => (
                <tr key={t.id} className="border-b border-border/50 hover:bg-muted/20 cursor-pointer"
                  onClick={() => setSelected(t)}>
                  <td className="py-2 font-mono">{t.orderNumber}</td>
                  <td className="py-2">{t.customer}</td>
                  <td className="py-2">${(t.amount / 100).toFixed(2)}</td>
                  <td className="py-2 capitalize">{t.paymentMethod}</td>
                  <td className="py-2"><StatusBadge status={t.status} /></td>
                  <td className="py-2 text-muted-foreground">{new Date(t.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isLoading && !data?.transactions?.length && (
            <p className="text-center text-xs text-muted-foreground py-6">No transactions found</p>
          )}
        </div>

        {data && data.pages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-muted-foreground">Page {data.page} of {data.pages} · {data.total} total</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="h-7 text-xs" disabled={data.page <= 1}
                onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))}>Prev</Button>
              <Button size="sm" variant="outline" className="h-7 text-xs" disabled={data.page >= data.pages}
                onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))}>Next</Button>
            </div>
          </div>
        )}
      </div>

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setSelected(null)}>
          <div className="glass-card rounded-xl p-6 w-full max-w-md space-y-3" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-semibold">Transaction Detail</h3>
            {[
              ["Order Number", selected.orderNumber],
              ["Customer", selected.customer],
              ["Email", selected.email],
              ["Amount", `$${(selected.amount / 100).toFixed(2)}`],
              ["Status", selected.status],
              ["Method", selected.paymentMethod],
              ["Reference", selected.reference],
              ["Stripe PI", selected.stripePaymentIntentId || "—"],
              ["Date", new Date(selected.createdAt).toLocaleString()],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs border-b border-border/50 pb-1">
                <span className="text-muted-foreground">{k}</span>
                <span className="font-medium font-mono">{v}</span>
              </div>
            ))}
            <Button size="sm" variant="outline" className="w-full text-xs mt-2" onClick={() => setSelected(null)}>Close</Button>
          </div>
        </div>
      )}
    </div>
  );
}