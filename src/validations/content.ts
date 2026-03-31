import { z } from "zod";

export const contentHeroSchema = z.object({
  heroTitle: z.string().min(1, "Headline is required").max(100),
  heroSubtitle: z.string().min(1, "Subheadline is required").max(500),
  heroImage: z.string().optional(),
});

export type ContentHeroFormData = z.infer<typeof contentHeroSchema>;
