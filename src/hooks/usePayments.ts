import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentsAPI } from "@/services/api/payments";
import { toast } from "sonner";

export function usePaymentsOverview() {
  return useQuery({ queryKey: ["payments", "overview"], queryFn: paymentsAPI.getOverview });
}

export function useTransactions(params?: any) {
  return useQuery({ queryKey: ["payments", "transactions", params], queryFn: () => paymentsAPI.getTransactions(params) });
}

export function useTransaction(id: string) {
  return useQuery({ queryKey: ["payments", "transaction", id], queryFn: () => paymentsAPI.getTransaction(id), enabled: !!id });
}

export function useRefunds() {
  return useQuery({ queryKey: ["payments", "refunds"], queryFn: paymentsAPI.getRefunds });
}

export function useIssueRefund() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: paymentsAPI.issueRefund,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["payments"] }); toast.success("Refund issued"); },
    onError: (e: any) => toast.error(e.response?.data?.message || "Refund failed"),
  });
}

export function usePayouts() {
  return useQuery({ queryKey: ["payments", "payouts"], queryFn: paymentsAPI.getPayouts });
}

export function usePaymentSettings() {
  return useQuery({ queryKey: ["payments", "settings"], queryFn: paymentsAPI.getSettings });
}

export function useUpdatePaymentSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: paymentsAPI.updateSettings,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["payments", "settings"] }); toast.success("Payment settings saved"); },
    onError: (e: any) => toast.error(e.response?.data?.message || "Failed to save"),
  });
}