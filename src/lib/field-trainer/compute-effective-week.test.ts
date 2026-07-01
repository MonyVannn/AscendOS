import { expect, test, describe } from "vitest";
import { computeEffectiveWeek, MS_PER_WEEK } from "./compute-effective-week";

describe("computeEffectiveWeek", () => {
  const START_TIME = 1000000000000;

  test("stays on same week if less than 7 days have passed", () => {
    const enrollment = {
      currentWeek: 0,
      programStartedAt: START_TIME,
    };
    
    expect(computeEffectiveWeek(enrollment, START_TIME)).toBe(0);
    expect(computeEffectiveWeek(enrollment, START_TIME + MS_PER_WEEK - 1)).toBe(0);
  });

  test("advances 1 week after exactly 7 days", () => {
    const enrollment = {
      currentWeek: 0,
      programStartedAt: START_TIME,
    };
    
    expect(computeEffectiveWeek(enrollment, START_TIME + MS_PER_WEEK)).toBe(1);
  });

  test("caps at FIELD_TRAINER_MAX_WEEK (5)", () => {
    const enrollment = {
      currentWeek: 3,
      programStartedAt: START_TIME,
    };
    
    expect(computeEffectiveWeek(enrollment, START_TIME + 10 * MS_PER_WEEK)).toBe(5);
  });
});
