import { z } from "zod";

export const couponSchema = z
  .object({
    code: z
      .string()
      .min(1, "Code is required")
      .max(20, "Code must be less than 20 characters")
      .regex(/^[A-Z0-9_-]+$/, "Code can only contain uppercase letters, numbers, hyphens, and underscores"),

    type: z.enum(["fixed_amount", "percentage"], {
      errorMap: () => ({ message: "Type must be fixed_amount or percentage" }),
    }),

    value: z
      .number()
      .min(0, "Value must be 0 or more")
      .refine(
        (val) => {
          // Percentage: 0-100
          // Fixed amount: any positive number
          return val >= 0;
        },
        "Value must be valid"
      ),

    description: z.string().optional(),

    minOrderAmount: z
      .number()
      .optional()
      .refine((val) => val === undefined || val >= 0, "Minimum order amount must be positive"),

    maxUsagePerUser: z
      .number()
      .optional()
      .refine((val) => val === undefined || val >= 1, "Max usage per user must be at least 1"),

    maxTotalUsage: z
      .number()
      .optional()
      .refine((val) => val === undefined || val >= 1, "Max total usage must be at least 1"),

    startDate: z
      .string()
      .min(1, "Start date is required")
      .refine(
        (date) => !isNaN(new Date(date).getTime()),
        "Invalid start date"
      ),

    endDate: z
      .string()
      .min(1, "End date is required")
      .refine(
        (date) => !isNaN(new Date(date).getTime()),
        "Invalid end date"
      ),

    isActive: z.boolean().default(true),
  })
  .refine(
    (data) => {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      return startDate < endDate;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  );

export type CouponFormData = z.infer<typeof couponSchema>;
export type CreateCouponRequest = z.infer<typeof couponSchema>;

export const bannerSchema = z
  .object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(100, "Title must be less than 100 characters"),

    description: z
      .string()
      .optional()
      .refine((val) => val === undefined || val.length <= 500, "Description must be less than 500 characters"),

    image: z
      .string()
      .min(1, "Image is required")
      .url("Image must be a valid URL"),

    ctaText: z
      .string()
      .optional()
      .refine((val) => val === undefined || val.length <= 50, "CTA text must be less than 50 characters"),

    ctaLink: z
      .string()
      .optional()
      .refine(
        (val) => val === undefined || val === "" || /^https?:\/\/.+/.test(val),
        "CTA link must be a valid URL starting with http:// or https://"
      ),

    startDate: z
      .string()
      .min(1, "Start date is required")
      .refine(
        (date) => !isNaN(new Date(date).getTime()),
        "Invalid start date"
      ),

    endDate: z
      .string()
      .min(1, "End date is required")
      .refine(
        (date) => !isNaN(new Date(date).getTime()),
        "Invalid end date"
      ),

    isActive: z.boolean().default(true),
  })
  .refine(
    (data) => {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      return startDate < endDate;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  );

export type BannerFormData = z.infer<typeof bannerSchema>;
export type CreateBannerRequest = z.infer<typeof bannerSchema>;