import { useMutation, useQuery } from "@tanstack/react-query";
import { notificationsAPI, SendNotificationRequest } from "@/services/api/notifications";
import { toast } from "sonner";

export function useSendNotification() {
  return useMutation({
    mutationFn: (data: SendNotificationRequest) => notificationsAPI.sendNotification(data),
    onSuccess: (response) => {
      toast.success(response.message || "Notification sent");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to send notification");
    },
  });
}

export function useNotificationTemplates() {
  return useQuery({
    queryKey: ["notifications", "templates"],
    queryFn: () => notificationsAPI.getTemplates(),
    placeholderData: [],
  });
}
