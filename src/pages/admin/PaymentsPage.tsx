import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard } from "lucide-react";

import { useAuthStore } from "@/store/authStore";
import OverviewTab from "@/components/payments/tab/OverviewTab";
import PaymentSettingsTab from "@/components/payments/tab/PaymentSettingsTab";
import PayoutsTab from "@/components/payments/tab/PayoutsTab";
import RefundsTab from "@/components/payments/tab/RefundsTab";
import TransactionsTab from "@/components/payments/tab/TransactionsTab";

export default function PaymentsPage() {
  const { hasRole } = useAuthStore();
  const isSuperAdmin = hasRole("superadmin");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <CreditCard className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-bold">Payments</h1>
          <p className="text-xs text-muted-foreground">Revenue, transactions, refunds & payouts</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="transactions" className="text-xs">Transactions</TabsTrigger>
          <TabsTrigger value="refunds" className="text-xs">Refunds</TabsTrigger>
          <TabsTrigger value="payouts" className="text-xs">Payouts</TabsTrigger>
          {isSuperAdmin && <TabsTrigger value="settings" className="text-xs">Settings</TabsTrigger>}
        </TabsList>
        <TabsContent value="overview"><OverviewTab /></TabsContent>
        <TabsContent value="transactions"><TransactionsTab /></TabsContent>
        <TabsContent value="refunds"><RefundsTab /></TabsContent>
        <TabsContent value="payouts"><PayoutsTab /></TabsContent>
        {isSuperAdmin && <TabsContent value="settings"><PaymentSettingsTab /></TabsContent>}
      </Tabs>
    </div>
  );
}