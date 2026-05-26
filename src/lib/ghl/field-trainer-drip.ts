import { z } from "zod";
import { FIELD_TRAINER_OPTIONS } from "./field-trainer-options";

const trainerValues = FIELD_TRAINER_OPTIONS.map((t) => t.value) as [string, ...string[]];

export const FIELD_TRAINER_START_TRIGGER_PRODUCTION_DRIP = "Production Drip Form Submitted";

export const fieldTrainerDripSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required"),
  phone: z.string().trim().min(1, "Phone number is required"),
  trainer: z.enum(trainerValues, {
    message: "Invalid trainer selected",
  }),
});

export type FieldTrainerDripInput = z.infer<typeof fieldTrainerDripSchema>;

export function buildFieldTrainerDripPayload(
  input: FieldTrainerDripInput,
  agent: { name: string; email: string; bookingLink: string }
) {
  return {
    first_name: input.first_name,
    phone: input.phone,
    field_trainer_start_trigger: FIELD_TRAINER_START_TRIGGER_PRODUCTION_DRIP,
    "contact.field_trainer": input.trainer,
    "contact.assigned_agent_name": agent.name,
    "contact.assigned_agent_email": agent.email,
    "contact.assigned_agent_booking_link": agent.bookingLink,
  };
}
