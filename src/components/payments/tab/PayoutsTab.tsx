import { usePayouts } from "@/hooks/usePayments";
import { StatusBadge } from "./OverviewTab";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PayoutsTab() {
  const { data, isLoading } = usePayouts();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 max-w-md">
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Available Balance</p>
          <p className="text-xl font-bold mt-1">${((data?.availableBalance || 0) / 100).toFixed(2)}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Pending Balance</p>
          <p className="text-xl font-bold mt-1">${((data?.pendingBalance || 0) / 100).toFixed(2)}</p>
        </div>
      </div>

      <Button size="sm" variant="outline" className="text-xs gap-1.5" asChild>
        <a href="https://dashboard.stripe.com/payouts" target="_blank" rel="noopener noreferrer">
          <ExternalLink className="h-3.5 w-3.5" /> Open Stripe Dashboard
        </a>
      </Button>

      <div className="glass-card rounded-xl p-4">
        <h3 className="text-sm font-semibold mb-3">Payout History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                {["ID", "Amount", "Currency", "Status", "Arrival Date"].map(h => (
                  <th key={h} className="text-left py-2 font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.payouts?.map((p: any) => (
                <tr key={p.id} className="border-b border-border/50">
                  <td className="py-2 font-mono text-[10px]">{p.id}</td>
                  <td className="py-2">${(p.amount / 100).toFixed(2)}</td>
                  <td className="py-2 uppercase">{p.currency}</td>
                  <td className="py-2"><StatusBadge status={p.status} /></td>
                  <td className="py-2 text-muted-foreground">{new Date(p.arrivalDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isLoading && !data?.payouts?.length && (
            <p className="text-center text-xs text-muted-foreground py-6">No payouts yet</p>
          )}
        </div>
      </div>
    </div>
  );
}