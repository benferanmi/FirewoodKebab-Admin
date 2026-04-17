import { useState } from "react";
import { useRefunds, useIssueRefund } from "@/hooks/usePayments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "./OverviewTab";
import { Plus } from "lucide-react";

export default function RefundsTab() {
  const { data: refunds, isLoading } = useRefunds();
  const issueRefund = useIssueRefund();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    orderId: "",
    amount: "",
    reason: "requested_by_customer",
  });

  const handleSubmit = () => {
    if (!form.orderId) return;
    issueRefund.mutate(
      {
        orderId: form.orderId,
        amount: form.amount ? Number(form.amount) : undefined,
        reason: form.reason,
      },
      {
        onSuccess: () => {
          setShowForm(false);
          setForm({ orderId: "", amount: "", reason: "requested_by_customer" });
        },
      },
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          size="sm"
          className="text-xs gap-1.5"
          onClick={() => setShowForm(true)}
        >
          <Plus className="h-3.5 w-3.5" /> Issue Refund
        </Button>
      </div>

      {showForm && (
        <div className="glass-card rounded-xl p-4 space-y-3 max-w-md">
          <h3 className="text-sm font-semibold">Issue New Refund</h3>
          <div className="space-y-2">
            <Label className="text-xs">Order ID</Label>
            <Input
              className="h-9 text-xs"
              placeholder="MongoDB order ID"
              value={form.orderId}
              onChange={(e) =>
                setForm((p) => ({ ...p, orderId: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">
              Amount (leave blank for full refund)
            </Label>
            <Input
              className="h-9 text-xs"
              type="number"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) =>
                setForm((p) => ({ ...p, amount: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Reason</Label>
            <Select
              value={form.reason}
              onValueChange={(v) => setForm((p) => ({ ...p, reason: v }))}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="requested_by_customer">
                  Requested by customer
                </SelectItem>
                <SelectItem value="duplicate">Duplicate</SelectItem>
                <SelectItem value="fraudulent">Fraudulent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="text-xs"
              onClick={handleSubmit}
              disabled={issueRefund.isPending}
            >
              {issueRefund.isPending ? "Processing..." : "Issue Refund"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="glass-card rounded-xl p-4">
        <h3 className="text-sm font-semibold mb-3">Refund History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                {["Refund ID", "Amount", "Reason", "Status", "Date"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left py-2 font-medium text-muted-foreground"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {refunds?.map((r: any) => (
                <tr key={r.id} className="border-b border-border/50">
                  <td className="py-2 font-mono">{r.id}</td>
                  <td className="py-2">${(r.amount / 100).toFixed(2)}</td>
                  <td className="py-2 capitalize">
                    {r.reason?.replace(/_/g, " ") || "—"}
                  </td>
                  <td className="py-2">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="py-2 text-muted-foreground">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isLoading && !refunds?.length && (
            <p className="text-center text-xs text-muted-foreground py-6">
              No refunds issued yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
