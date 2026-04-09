import { useMutation, useQuery } from "@tanstack/react-query";
import { useFiltersStore } from "@/store/filtersStore";
import { adminDeliveryZonesAPI, IDeliveryZone } from "@/services/api/delivery";
import { toast } from "sonner";

// GET ALL ZONES
export const useAdminDeliveryZones = () => {
  const { deliveryZoneFilters } = useFiltersStore();

  return useQuery({
    queryKey: ["admin", "delivery-zones", deliveryZoneFilters],
    queryFn: () =>
      adminDeliveryZonesAPI.getZones({
        page: deliveryZoneFilters.page,
        limit: deliveryZoneFilters.limit,
        search: deliveryZoneFilters.search,
        type: deliveryZoneFilters.type,
        status: deliveryZoneFilters.status,
        sortBy: deliveryZoneFilters.sortBy,
        sortOrder: deliveryZoneFilters.sortOrder,
      }),
    staleTime: 30000, // 30 seconds
  });
};

// GET SINGLE ZONE
export const useAdminDeliveryZone = (id: string | undefined) => {
  return useQuery({
    queryKey: ["admin", "delivery-zone", id],
    queryFn: () => adminDeliveryZonesAPI.getZone(id!),
    enabled: !!id,
  });
};

// CREATE ZONE
export const useCreateDeliveryZone = () => {
  return useMutation({
    mutationFn: (data: Partial<IDeliveryZone>) =>
      adminDeliveryZonesAPI.createZone(data),
    onSuccess: () => {
      toast.success("Zone created successfully");
      // Refetch zones list
      // Can use queryClient here if needed
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to create zone";
      toast.error(message);
    },
  });
};

// UPDATE ZONE
export const useUpdateDeliveryZone = () => {
  return useMutation({
    mutationFn: (variables: { id: string; data: Partial<IDeliveryZone> }) =>
      adminDeliveryZonesAPI.updateZone(variables.id, variables.data),
    onSuccess: () => {
      toast.success("Zone updated successfully");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to update zone";
      toast.error(message);
    },
  });
};

// DELETE ZONE
export const useDeleteDeliveryZone = () => {
  return useMutation({
    mutationFn: (id: string) => adminDeliveryZonesAPI.deleteZone(id),
    onSuccess: () => {
      toast.success("Zone deleted successfully");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to delete zone";
      toast.error(message);
    },
  });
};

// TOGGLE ACTIVE
export const useToggleDeliveryZoneActive = () => {
  return useMutation({
    mutationFn: (id: string) => adminDeliveryZonesAPI.toggleZoneActive(id),
    onSuccess: (data) => {
      const status = data.active ? "activated" : "deactivated";
      toast.success(`Zone ${status}`);
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to update zone status";
      toast.error(message);
    },
  });
};
