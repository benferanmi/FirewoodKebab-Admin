import { z } from "zod";

export const notificationSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  message: z.string().min(1, "Message is required").max(1000),
  recipientFilter: z.string().min(1, "Select recipients"),
  sendToEmail: z.boolean().default(true),
  sendToSMS: z.boolean().default(false),
  sendToPush: z.boolean().default(false),
  sendToInApp: z.boolean().default(true),
});

export type NotificationFormData = z.infer<typeof notificationSchema>;
