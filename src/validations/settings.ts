import { z } from "zod";

export const restaurantSettingsSchema = z.object({
  name: z.string().min(1, "Name is required"),
  tagline: z.string().min(1, "Tagline is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email"),
  address: z.string().min(1, "Address is required"),
  website: z.string().url().optional().or(z.literal("")),
  openingHours: z.record(
    z.object({
      open: z.boolean(),
      startTime: z.string(),
      endTime: z.string(),
    })
  ),
});

export type RestaurantSettingsFormData = z.infer<typeof restaurantSettingsSchema>;

export const deliverySettingsSchema = z.object({
  radiusKm: z.coerce.number().min(1, "Radius must be at least 1km"),
  flatFee: z.coerce.number().min(0).optional(),
  feePerKm: z.coerce.number().min(0).optional(),
  minOrderAmount: z.coerce.number().min(0).optional(),
  freeDeliveryThreshold: z.coerce.number().min(0).optional(),
});

export type DeliverySettingsFormData = z.infer<typeof deliverySettingsSchema>;

export const paymentSettingsSchema = z.object({
  paystackEnabled: z.boolean(),
  stripeEnabled: z.boolean(),
  paystackPublicKey: z.string().optional(),
  stripePublicKey: z.string().optional(),
});

export type PaymentSettingsFormData = z.infer<typeof paymentSettingsSchema>;

export const emailSettingsSchema = z.object({
  transport: z.enum(["gmail", "mailgun", "resend"]),
  fromName: z.string().min(1, "From name is required"),
  fromEmail: z.string().email("Invalid email"),
  mailgunDomain: z.string().optional(),
  resendApiKey: z.string().optional(),
});

export type EmailSettingsFormData = z.infer<typeof emailSettingsSchema>;
