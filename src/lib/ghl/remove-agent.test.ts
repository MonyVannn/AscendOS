import { describe, it, expect } from "vitest";
import {
  removeAgentSchema,
  buildRemoveAgentPayload,
} from "./remove-agent";

describe("remove-agent schema", () => {
  it("validates valid input", () => {
    const result = removeAgentSchema.safeParse({
      first_name: "John",
      phone: "555-1234",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing first_name", () => {
    const result = removeAgentSchema.safeParse({
      phone: "555-1234",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing phone", () => {
    const result = removeAgentSchema.safeParse({
      first_name: "John",
    });
    expect(result.success).toBe(false);
  });
});

describe("buildRemoveAgentPayload", () => {
  it("builds the correct payload", () => {
    const input = {
      first_name: "John",
      phone: "555-1234",
    };

    const payload = buildRemoveAgentPayload(input);

    expect(payload).toEqual({
      first_name: "John",
      phone: "555-1234",
    });
  });
});
