import { describe, it, expect } from "vitest";
import {
  fieldTrainerDripSchema,
  buildFieldTrainerDripPayload,
  buildFieldTrainerReassignPayload,
  FIELD_TRAINER_START_TRIGGER_PRODUCTION_DRIP,
  FIELD_TRAINER_START_TRIGGER_REASSIGN,
} from "./field-trainer-drip";

const validInput = {
  first_name: "John",
  phone: "5551234567",
  trainer: "Jon",
};

describe("fieldTrainerDripSchema", () => {
  it("validates correct input", () => {
    expect(fieldTrainerDripSchema.parse(validInput)).toEqual(validInput);
  });

  it("normalizes formatted phone numbers", () => {
    expect(
      fieldTrainerDripSchema.parse({
        ...validInput,
        phone: "(555) 123-4567",
      })
    ).toEqual(validInput);
  });

  it("rejects missing fields", () => {
    expect(() =>
      fieldTrainerDripSchema.parse({ phone: "5551234567", trainer: "Jon" })
    ).toThrow();
    expect(() =>
      fieldTrainerDripSchema.parse({ first_name: "John", trainer: "Jon" })
    ).toThrow();
  });

  it("rejects short agent names", () => {
    expect(() =>
      fieldTrainerDripSchema.parse({
        ...validInput,
        first_name: "Jo",
      })
    ).toThrow();
  });

  it("rejects invalid phone numbers", () => {
    expect(() =>
      fieldTrainerDripSchema.parse({
        ...validInput,
        phone: "555-1234",
      })
    ).toThrow();
    expect(() =>
      fieldTrainerDripSchema.parse({
        ...validInput,
        phone: "55512345678",
      })
    ).toThrow();
    expect(() =>
      fieldTrainerDripSchema.parse({
        ...validInput,
        phone: "555abc4567",
      })
    ).toThrow();
  });

  it("rejects invalid trainer", () => {
    expect(() =>
      fieldTrainerDripSchema.parse({
        ...validInput,
        trainer: "Invalid Trainer",
      })
    ).toThrow();
  });
});

describe("buildFieldTrainerDripPayload", () => {
  it("maps fields correctly", () => {
    const agent = {
      name: "Agent Smith",
      email: "agent@example.com",
      bookingLink: "https://book.me",
    };

    const payload = buildFieldTrainerDripPayload(validInput, agent);

    expect(payload).toEqual({
      first_name: "John",
      phone: "5551234567",
      field_trainer_start_trigger: FIELD_TRAINER_START_TRIGGER_PRODUCTION_DRIP,
      "contact.field_trainer": "Jon",
      "contact.assigned_agent_name": "Agent Smith",
      "contact.assigned_agent_email": "agent@example.com",
      "contact.assigned_agent_booking_link": "https://book.me",
    });
  });
});

describe("buildFieldTrainerReassignPayload", () => {
  it("maps fields correctly", () => {
    const agent = {
      name: "Agent Smith",
      email: "agent@example.com",
      bookingLink: "https://book.me",
    };

    const payload = buildFieldTrainerReassignPayload(validInput, agent);

    expect(payload).toEqual({
      first_name: "John",
      phone: "5551234567",
      field_trainer_start_trigger: FIELD_TRAINER_START_TRIGGER_REASSIGN,
      "contact.field_trainer": "Jon",
      "contact.assigned_agent_name": "Agent Smith",
      "contact.assigned_agent_email": "agent@example.com",
      "contact.assigned_agent_booking_link": "https://book.me",
    });
  });
});
