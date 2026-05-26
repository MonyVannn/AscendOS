import { describe, it, expect } from "vitest";
import {
  fieldTrainerRepositionSchema,
  buildFieldTrainerRepositionPayload,
} from "./field-trainer-reposition";

describe("fieldTrainerRepositionSchema", () => {
  it("validates correct input", () => {
    const valid = {
      first_name: "John",
      phone: "555-1234",
      current_week: 1,
    };
    expect(fieldTrainerRepositionSchema.parse(valid)).toEqual(valid);
  });

  it("rejects missing fields", () => {
    expect(() =>
      fieldTrainerRepositionSchema.parse({ phone: "555-1234", current_week: 1 })
    ).toThrow();
    expect(() =>
      fieldTrainerRepositionSchema.parse({ first_name: "John", current_week: 1 })
    ).toThrow();
    expect(() =>
      fieldTrainerRepositionSchema.parse({ first_name: "John", phone: "555-1234" })
    ).toThrow();
  });

  it("rejects invalid week", () => {
    expect(() =>
      fieldTrainerRepositionSchema.parse({
        first_name: "John",
        phone: "555-1234",
        current_week: -1,
      })
    ).toThrow();
    expect(() =>
      fieldTrainerRepositionSchema.parse({
        first_name: "John",
        phone: "555-1234",
        current_week: 1.5,
      })
    ).toThrow();
  });
});

describe("buildFieldTrainerRepositionPayload", () => {
  it("maps fields correctly", () => {
    const input = {
      first_name: "John",
      phone: "555-1234",
      current_week: 2,
    };
    const agent = {
      name: "Agent Smith",
      email: "agent@example.com",
      bookingLink: "https://book.me",
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload = buildFieldTrainerRepositionPayload(input as any, agent);

    expect(payload).toEqual({
      first_name: "John",
      phone: "555-1234",
      current_week: 2,
      "contact.assigned_agent_name": "Agent Smith",
      "contact.assigned_agent_email": "agent@example.com",
      "contact.assigned_agent_booking_link": "https://book.me",
    });
  });
});
