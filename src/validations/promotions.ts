import { z } from "zod";

export const couponSchema = z.object({
  code: z.string().min(1, "Code is required").max(30).transform((v) => v.toUpperCase()),
  type: z.enum(["fixed_amount", "percentage"]),
  value: z.coerce.number().min(1, "Value must be positive"),
  description: z.string().max(200).optional(),
  minOrderAmount: z.coerce.number().min(0).optional(),
  maxUsagePerUser: z.coerce.number().min(1).optional(),
  maxTotalUsage: z.coerce.number().min(1).optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  isActive: z.boolean().default(true),
});

export type CouponFormData = z.infer<typeof couponSchema>;

export const bannerSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
  image: z.string().min(1, "Image is required"),
  ctaText: z.string().max(50).optional(),
  ctaLink: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  isActive: z.boolean().default(true),
});

export type BannerFormData = z.infer<typeof bannerSchema>;
