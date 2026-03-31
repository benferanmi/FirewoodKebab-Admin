import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customersAPI, CustomerFilters } from "@/services/api/customers";
import { toast } from "sonner";

export function useCustomers(params?: CustomerFilters) {
  return useQuery({
    queryKey: ["customers", params],
    queryFn: () => customersAPI.getCustomers(params),
    // placeholderData: { data: mockCustomers, pagination: undefined },
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: ["customers", id],
    queryFn: () => customersAPI.getCustomer(id),
    enabled: !!id,
  });
}

export function useBlockCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      customersAPI.blockCustomer(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer blocked");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to block customer");
    },
  });
}

export function useUnblockCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customersAPI.unblockCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer unblocked");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to unblock customer");
    },
  });
}

export function useCustomerOrders(id: string, params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["customers", id, "orders", params],
    queryFn: () => customersAPI.getCustomerOrders(id, params),
    enabled: !!id,
  });
}
