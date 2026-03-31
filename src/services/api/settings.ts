import client from "./client";
import { API_ENDPOINTS } from "@/config/api";

export interface RestaurantSettings {
  name: string;
  logo?: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  openingHours: Record<
    string,
    { open: boolean; startTime: string; endTime: string }
  >;
  website?: string;
}

export interface DeliverySettings {
  radiusKm: number;
  feePerKm?: number;
  flatFee?: number;
  minOrderAmount?: number;
  freeDeliveryThreshold?: number;
}

export interface PaymentSettings {
  paystackEnabled: boolean;
  stripeEnabled: boolean;
  paystackPublicKey?: string;
  stripePublicKey?: string;
}

export interface EmailSettings {
  transport: "gmail" | "mailgun" | "resend";
  fromName: string;
  fromEmail: string;
  mailgunDomain?: string;
  resendApiKey?: string;
}

export const settingsAPI = {
  // Restaurant
  getRestaurantSettings: () =>
    client
      .get(API_ENDPOINTS.SETTINGS_RESTAURANT)
      .then((r) => r.data.data as RestaurantSettings),

  updateRestaurantSettings: (data: Partial<RestaurantSettings>) =>
    client
      .put(API_ENDPOINTS.SETTINGS_RESTAURANT, data)
      .then((r) => r.data.data as RestaurantSettings),

  // Delivery
  getDeliverySettings: () =>
    client
      .get(API_ENDPOINTS.SETTINGS_DELIVERY)
      .then((r) => r.data.data as DeliverySettings),

  updateDeliverySettings: (data: Partial<DeliverySettings>) =>
    client
      .put(API_ENDPOINTS.SETTINGS_DELIVERY, data)
      .then((r) => r.data.data as DeliverySettings),

  // Payment
  getPaymentSettings: () =>
    client
      .get(API_ENDPOINTS.SETTINGS_PAYMENT)
      .then((r) => r.data.data as PaymentSettings),

  updatePaymentSettings: (data: Partial<PaymentSettings>) =>
    client
      .put(API_ENDPOINTS.SETTINGS_PAYMENT, data)
      .then((r) => r.data.data as PaymentSettings),

  // Email
  getEmailSettings: () =>
    client
      .get(API_ENDPOINTS.SETTINGS_EMAIL)
      .then((r) => r.data.data as EmailSettings),

  updateEmailSettings: (data: Partial<EmailSettings>) =>
    client
      .put(API_ENDPOINTS.SETTINGS_EMAIL, data)
      .then((r) => r.data.data as EmailSettings),

  getSocialSettings: () =>
    client.get("/admin/settings/social").then((r) => r.data.data),
  updateSocialSettings: (data: any) =>
    client.put("/admin/settings/social", data).then((r) => r.data.data),
  getSupportSettings: () =>
    client.get("/admin/settings/support").then((r) => r.data.data),
  updateSupportSettings: (data: any) =>
    client.put("/admin/settings/support", data).then((r) => r.data.data),

  sendTestEmail: (email: string) =>
    client
      .post(API_ENDPOINTS.SETTINGS_TEST_EMAIL, { email })
      .then((r) => r.data),
};
