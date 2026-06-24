import { z } from "zod";

export const BEAST_MODE_DRIP_LABEL = "Beast Mode Drip";

export const beastModeDripSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required"),
  last_name: z.string().trim().min(1, "Last name is required"),
  email: z.string().trim().email("Invalid email address"),
  phone: z.string().trim().min(1, "Phone number is required"),
  sales_academy_start_date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD"),
});

export type BeastModeDripInput = z.infer<typeof beastModeDripSchema>;

export function buildBeastModeDripPayload(input: BeastModeDripInput) {
  return {
    first_name: input.first_name,
    last_name: input.last_name,
    email: input.email,
    phone: input.phone,
    sales_academy_start_date: input.sales_academy_start_date,
  };
}
