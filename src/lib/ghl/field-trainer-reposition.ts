import { z } from "zod";

export const fieldTrainerRepositionSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required"),
  phone: z.string().trim().min(1, "Phone number is required"),
  current_week: z.number().int().min(0, "Week must be 0 or greater"),
});

export type FieldTrainerRepositionInput = z.infer<typeof fieldTrainerRepositionSchema>;

export function buildFieldTrainerRepositionPayload(
  input: FieldTrainerRepositionInput,
  agent: { name: string; email: string; bookingLink: string }
) {
  return {
    first_name: input.first_name,
    phone: input.phone,
    current_week: input.current_week,
    "contact.assigned_agent_name": agent.name,
    "contact.assigned_agent_email": agent.email,
    "contact.assigned_agent_booking_link": agent.bookingLink,
  };
}
