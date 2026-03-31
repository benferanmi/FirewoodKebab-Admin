import { z } from "zod";

export const teamMemberSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(1, "Phone is required"),
  password: z.string().min(8, "Min 8 characters").optional(),
  role: z.enum(["superadmin", "admin", "manager", "kitchen", "delivery"]),
  isActive: z.boolean().default(true),
});

export type TeamMemberFormData = z.infer<typeof teamMemberSchema>;
