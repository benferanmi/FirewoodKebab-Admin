import { z } from "zod";

export const menuItemSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000),
  price: z.number().min(0, "Price must be positive"),
  categoryId: z.string().min(1, "Category is required"),
  categoryName: z.string().min(1, "Category name is required"),
  image: z.string().min(1, "Image is required"),
  variants: z
    .array(
      z.object({
        groupName: z.string().min(1, "Group name required"),
        options: z.array(
          z.object({
            name: z.string().min(1, "Option name required"),
            additionalPrice: z.coerce.number().min(0),
          })
        ),
      })
    )
    .default([]),
  dietaryTags: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
  isAvailable: z.boolean().default(true),
  isCatering: z.boolean().default(false),
  stock: z.coerce.number().min(0).optional(),
});

export type MenuItemFormData = z.infer<typeof menuItemSchema>;

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  image: z.string().optional(),
  description: z.string().max(200).optional(),
  displayOrder: z.coerce.number().min(0).default(0),
  isActive: z.boolean().default(true),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
