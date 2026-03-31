import client from "./client";
import { API_ENDPOINTS } from "@/config/api";

export interface SendNotificationRequest {
  title: string;
  message: string;
  recipientFilter: { userType: string };
  sendToEmail?: boolean;
  sendToSMS?: boolean;
  sendToPush?: boolean;
  sendToInApp?: boolean;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

export const notificationsAPI = {
  sendNotification: (data: SendNotificationRequest) =>
    client.post(API_ENDPOINTS.NOTIFICATIONS_SEND, data).then((r) => r.data),

  getTemplates: () =>
    client.get(API_ENDPOINTS.NOTIFICATIONS_TEMPLATES).then((r) => r.data.data as NotificationTemplate[]),
};
