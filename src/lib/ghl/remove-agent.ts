import { z } from "zod";

export const removeAgentSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required"),
  phone: z.string().trim().min(1, "Phone number is required"),
});

export type RemoveAgentInput = z.infer<typeof removeAgentSchema>;

export function buildRemoveAgentPayload(
  input: RemoveAgentInput
) {
  return {
    first_name: input.first_name,
    phone: input.phone,
  };
}
