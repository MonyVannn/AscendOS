import { expect, test, describe } from "vitest";
import { computeEffectiveWeek, applyWeekChange, getMissedAutoAdvances, MS_PER_WEEK } from "./fieldTrainerWeek";

describe("fieldTrainerWeek", () => {
  const START_TIME = 1000000000000;

  describe("computeEffectiveWeek", () => {
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

    test("advances multiple weeks if enough time passed", () => {
      const enrollment = {
        currentWeek: 1,
        programStartedAt: START_TIME - MS_PER_WEEK, // started a week ago
        weekEffectiveAt: START_TIME, // manual reposition at START_TIME
      };
      
      expect(computeEffectiveWeek(enrollment, START_TIME + 2 * MS_PER_WEEK)).toBe(3);
    });

    test("caps at FIELD_TRAINER_MAX_WEEK (5)", () => {
      const enrollment = {
        currentWeek: 3,
        programStartedAt: START_TIME,
      };
      
      expect(computeEffectiveWeek(enrollment, START_TIME + 10 * MS_PER_WEEK)).toBe(5);
    });

    test("uses weekEffectiveAt if available", () => {
      const enrollment = {
        currentWeek: 2,
        programStartedAt: START_TIME,
        weekEffectiveAt: START_TIME + MS_PER_WEEK,
      };
      
      // 1 day after reposition
      expect(computeEffectiveWeek(enrollment, START_TIME + MS_PER_WEEK + 86400000)).toBe(2);
      
      // 7 days after reposition
      expect(computeEffectiveWeek(enrollment, START_TIME + 2 * MS_PER_WEEK)).toBe(3);
    });
  });

  describe("applyWeekChange", () => {
    test("returns correct patch for week 0-4", () => {
      const patch = applyWeekChange(2, START_TIME);
      expect(patch).toEqual({
        currentWeek: 2,
        weekEffectiveAt: START_TIME,
        programStatus: "active",
        updatedAt: START_TIME,
      });
    });

    test("returns completed status for week 5", () => {
      const patch = applyWeekChange(5, START_TIME);
      expect(patch).toEqual({
        currentWeek: 5,
        weekEffectiveAt: START_TIME,
        programStatus: "completed",
        updatedAt: START_TIME,
      });
    });

    test("caps targetWeek to 0-5", () => {
      const patchBelow = applyWeekChange(-1, START_TIME);
      expect(patchBelow.currentWeek).toBe(0);

      const patchAbove = applyWeekChange(10, START_TIME);
      expect(patchAbove.currentWeek).toBe(5);
      expect(patchAbove.programStatus).toBe("completed");
    });
  });

  describe("getMissedAutoAdvances", () => {
    test("returns empty if less than a week passed", () => {
      const enrollment = {
        currentWeek: 0,
        programStartedAt: START_TIME,
      };
      
      const advances = getMissedAutoAdvances(enrollment, START_TIME + MS_PER_WEEK - 1);
      expect(advances.length).toBe(0);
    });

    test("returns 1 advance after 7 days", () => {
      const enrollment = {
        currentWeek: 0,
        programStartedAt: START_TIME,
      };
      
      const advances = getMissedAutoAdvances(enrollment, START_TIME + MS_PER_WEEK);
      expect(advances).toEqual([
        { week: 1, occurredAt: START_TIME + MS_PER_WEEK }
      ]);
    });

    test("returns multiple advances if multiple weeks passed", () => {
      const enrollment = {
        currentWeek: 1,
        programStartedAt: START_TIME,
      };
      
      const advances = getMissedAutoAdvances(enrollment, START_TIME + 2.5 * MS_PER_WEEK);
      expect(advances).toEqual([
        { week: 2, occurredAt: START_TIME + MS_PER_WEEK },
        { week: 3, occurredAt: START_TIME + 2 * MS_PER_WEEK }
      ]);
    });

    test("caps at FIELD_TRAINER_MAX_WEEK", () => {
      const enrollment = {
        currentWeek: 3,
        programStartedAt: START_TIME,
      };
      
      const advances = getMissedAutoAdvances(enrollment, START_TIME + 10 * MS_PER_WEEK);
      expect(advances).toEqual([
        { week: 4, occurredAt: START_TIME + MS_PER_WEEK },
        { week: 5, occurredAt: START_TIME + 2 * MS_PER_WEEK }
      ]);
    });
  });
});
