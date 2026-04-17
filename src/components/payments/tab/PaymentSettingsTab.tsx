import { useState } from "react";
import {
  usePaymentSettings,
  useUpdatePaymentSettings,
} from "@/hooks/usePayments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, X } from "lucide-react";

export default function PaymentSettingsTab() {
  const { data } = usePaymentSettings();
  const update = useUpdatePaymentSettings();
  const [form, setForm] = useState<Record<string, any>>({});
  const [tipInput, setTipInput] = useState("");

  const get = (field: string) => form[field] ?? data?.[field];

  const tipPercentages: number[] = get("tipPercentages") ?? [15, 18, 20];

  const addTip = () => {
    const val = Number(tipInput);
    if (!val || tipPercentages.includes(val)) return;
    setForm((p) => ({
      ...p,
      tipPercentages: [...tipPercentages, val].sort((a, b) => a - b),
    }));
    setTipInput("");
  };

  const removeTip = (pct: number) => {
    setForm((p) => ({
      ...p,
      tipPercentages: tipPercentages.filter((t) => t !== pct),
    }));
  };

  const handleSave = () => update.mutate(form);

  return (
    <div className="glass-card rounded-xl p-6 space-y-6 max-w-lg">
      <h3 className="text-sm font-semibold">Payment Settings</h3>

      {/* Stripe */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Stripe
        </p>
        <div className="flex items-center justify-between p-3 rounded-lg border border-border">
          <div>
            <p className="text-sm font-medium">Enable Stripe</p>
          </div>
          <Switch
            checked={get("stripeEnabled") ?? false}
            onCheckedChange={(v) =>
              setForm((p) => ({ ...p, stripeEnabled: v }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Publishable Key</Label>
          <Input
            className="h-9 text-xs font-mono"
            placeholder="pk_live_..."
            value={get("stripePublicKey") ?? ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, stripePublicKey: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Secret Key</Label>
          <Input
            className="h-9 text-xs font-mono"
            placeholder="sk_live_..."
            value={get("stripeSecretKey") ?? ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, stripeSecretKey: e.target.value }))
            }
          />
          <p className="text-[10px] text-muted-foreground">
            Stored encrypted. Shown masked after save.
          </p>
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Webhook Secret</Label>
          <Input
            className="h-9 text-xs font-mono"
            placeholder="whsec_..."
            value={get("stripeWebhookSecret") ?? ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, stripeWebhookSecret: e.target.value }))
            }
          />
        </div>
      </div>

      {/* Cash on Delivery */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Cash on Delivery
        </p>
        <div className="flex items-center justify-between p-3 rounded-lg border border-border">
          <div>
            <p className="text-sm font-medium">Enable Cash on Delivery</p>
            <p className="text-xs text-muted-foreground">
              Customers can pay in cash at delivery
            </p>
          </div>
          <Switch
            checked={get("cashOnDeliveryEnabled") ?? false}
            onCheckedChange={(v) =>
              setForm((p) => ({ ...p, cashOnDeliveryEnabled: v }))
            }
          />
        </div>
      </div>

      {/* Tips */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Tips
        </p>
        <div className="flex items-center justify-between p-3 rounded-lg border border-border">
          <div>
            <p className="text-sm font-medium">Enable Tips</p>
            <p className="text-xs text-muted-foreground">
              Show tip selection at checkout
            </p>
          </div>
          <Switch
            checked={get("tipsEnabled") ?? false}
            onCheckedChange={(v) => setForm((p) => ({ ...p, tipsEnabled: v }))}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Tip Percentages</Label>
          <div className="flex flex-wrap gap-2">
            {tipPercentages.map((pct) => (
              <span
                key={pct}
                className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-xs"
              >
                {pct}%
                <button
                  onClick={() => removeTip(pct)}
                  className="hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              className="h-8 text-xs w-20"
              type="number"
              placeholder="e.g. 25"
              value={tipInput}
              onChange={(e) => setTipInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTip()}
            />
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={addTip}
            >
              Add
            </Button>
          </div>
        </div>
      </div>

      <Button size="sm" onClick={handleSave} disabled={update.isPending}>
        <Save className="h-3.5 w-3.5 mr-1.5" />
        {update.isPending ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
}
