import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsAPI } from "@/services/api/settings";
import { toast } from "sonner";

// Restaurant Settings
export function useRestaurantSettings() {
  return useQuery({
    queryKey: ["settings", "restaurant"],
    queryFn: () => settingsAPI.getRestaurantSettings(),
    // placeholderData: {
    //   name: "Firewoodkebabadmin Restaurant",
    //   tagline: "Delicious food, delivered",
    //   phone: "+234 801 000 0000",
    //   email: "hello@Firewoodkebabadmin.com",
    //   address: "123 Marina Street, Lagos",
    //   openingHours: {
    //     Monday: { open: true, startTime: "09:00", endTime: "21:00" },
    //     Tuesday: { open: true, startTime: "09:00", endTime: "21:00" },
    //     Wednesday: { open: true, startTime: "09:00", endTime: "21:00" },
    //     Thursday: { open: true, startTime: "09:00", endTime: "21:00" },
    //     Friday: { open: true, startTime: "09:00", endTime: "21:00" },
    //     Saturday: { open: true, startTime: "09:00", endTime: "21:00" },
    //     Sunday: { open: false, startTime: "09:00", endTime: "21:00" },
    //   },
    // },
  });
}

export function useUpdateRestaurantSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: settingsAPI.updateRestaurantSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "restaurant"] });
      toast.success("Restaurant settings saved");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to save settings");
    },
  });
}

// Delivery Settings
export function useDeliverySettings() {
  return useQuery({
    queryKey: ["settings", "delivery"],
    queryFn: () => settingsAPI.getDeliverySettings(),
    // placeholderData: { radiusKm: 15, flatFee: 1500, minOrderAmount: 3000, freeDeliveryThreshold: 15000 },
  });
}

export function useUpdateDeliverySettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: settingsAPI.updateDeliverySettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "delivery"] });
      toast.success("Delivery settings saved");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to save settings");
    },
  });
}

// Payment Settings
export function usePaymentSettings() {
  return useQuery({
    queryKey: ["settings", "payment"],
    queryFn: () => settingsAPI.getPaymentSettings(),
    // placeholderData: {  stripeEnabled: false, paystackPublicKey: "pk_live_xxxx" },
  });
}

export function useUpdatePaymentSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: settingsAPI.updatePaymentSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "payment"] });
      toast.success("Payment settings saved");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to save settings");
    },
  });
}

// Email Settings
export function useEmailSettings() {
  return useQuery({
    queryKey: ["settings", "email"],
    queryFn: () => settingsAPI.getEmailSettings(),
    // placeholderData: { transport: "gmail" as const, fromName: "Firewoodkebabadmin", fromEmail: "noreply@Firewoodkebabadmin.com" },
  });
}

export function useUpdateEmailSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: settingsAPI.updateEmailSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "email"] });
      toast.success("Email settings saved");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to save settings");
    },
  });
}

export function useSendTestEmail() {
  return useMutation({
    mutationFn: (email: string) => settingsAPI.sendTestEmail(email),
    onSuccess: () => {
      toast.success("Test email sent");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to send test email");
    },
  });
}

// Social Settings
export function useSocialSettings() {
  return useQuery({
    queryKey: ["settings", "social"],
    queryFn: () => settingsAPI.getSocialSettings(),
  });
}

export function useUpdateSocialSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: settingsAPI.updateSocialSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "social"] });
      toast.success("Social settings saved");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to save settings");
    },
  });
}

// Support Settings
export function useSupportSettings() {
  return useQuery({
    queryKey: ["settings", "support"],
    queryFn: () => settingsAPI.getSupportSettings(),
  });
}

export function useUpdateSupportSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: settingsAPI.updateSupportSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "support"] });
      toast.success("Support settings saved");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to save settings");
    },
  });
}
