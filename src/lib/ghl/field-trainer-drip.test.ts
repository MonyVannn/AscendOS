import { describe, it, expect } from "vitest";
import {
  fieldTrainerDripSchema,
  buildFieldTrainerDripPayload,
  FIELD_TRAINER_START_TRIGGER_PRODUCTION_DRIP,
} from "./field-trainer-drip";

describe("fieldTrainerDripSchema", () => {
  it("validates correct input", () => {
    const valid = {
      first_name: "John",
      phone: "555-1234",
      trainer: "Jon",
    };
    expect(fieldTrainerDripSchema.parse(valid)).toEqual(valid);
  });

  it("rejects missing fields", () => {
    expect(() =>
      fieldTrainerDripSchema.parse({ phone: "555-1234", trainer: "Jon" })
    ).toThrow();
    expect(() =>
      fieldTrainerDripSchema.parse({ first_name: "John", trainer: "Jon" })
    ).toThrow();
  });

  it("rejects invalid trainer", () => {
    expect(() =>
      fieldTrainerDripSchema.parse({
        first_name: "John",
        phone: "555-1234",
        trainer: "Invalid Trainer",
      })
    ).toThrow();
  });
});

describe("buildFieldTrainerDripPayload", () => {
  it("maps fields correctly", () => {
    const input = {
      first_name: "John",
      phone: "555-1234",
      trainer: "Jon",
    };
    const agent = {
      name: "Agent Smith",
      email: "agent@example.com",
      bookingLink: "https://book.me",
    };

    const payload = buildFieldTrainerDripPayload(input as any, agent);

    expect(payload).toEqual({
      first_name: "John",
      phone: "555-1234",
      field_trainer_start_trigger: FIELD_TRAINER_START_TRIGGER_PRODUCTION_DRIP,
      "contact.field_trainer": "Jon",
      "contact.assigned_agent_name": "Agent Smith",
      "contact.assigned_agent_email": "agent@example.com",
      "contact.assigned_agent_booking_link": "https://book.me",
    });
  });
});
