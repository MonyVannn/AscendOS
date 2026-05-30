import { describe, it, expect } from "vitest";
import {
  getPeriodRange,
  computeLogMetrics,
  buildDashboardMetrics,
  formatRelativeTime,
  formatDurationMs,
  LogLike,
} from "./dashboard-period";
import { startOfWeek, endOfWeek, subWeeks } from "date-fns";

describe("dashboard-period", () => {
  const referenceDate = new Date("2026-05-22T12:00:00.000Z"); // Friday

  describe("getPeriodRange", () => {
    it("returns correct bounds for this_week", () => {
      const range = getPeriodRange("this_week", referenceDate);
      expect(range.label).toBe("This week");

      const expectedCurrentStart = startOfWeek(referenceDate, { weekStartsOn: 1 }).getTime();
      const expectedCurrentEnd = endOfWeek(referenceDate, { weekStartsOn: 1 }).getTime();
      expect(range.current.startMs).toBe(expectedCurrentStart);
      expect(range.current.endMs).toBe(expectedCurrentEnd);

      const expectedPriorStart = startOfWeek(subWeeks(referenceDate, 1), { weekStartsOn: 1 }).getTime();
      const expectedPriorEnd = endOfWeek(subWeeks(referenceDate, 1), { weekStartsOn: 1 }).getTime();
      expect(range.prior.startMs).toBe(expectedPriorStart);
      expect(range.prior.endMs).toBe(expectedPriorEnd);
    });

    it("returns correct bounds for last_week", () => {
      const range = getPeriodRange("last_week", referenceDate);
      expect(range.label).toBe("Last week");

      const lastWeekDate = subWeeks(referenceDate, 1);
      const expectedCurrentStart = startOfWeek(lastWeekDate, { weekStartsOn: 1 }).getTime();
      const expectedCurrentEnd = endOfWeek(lastWeekDate, { weekStartsOn: 1 }).getTime();
      expect(range.current.startMs).toBe(expectedCurrentStart);
      expect(range.current.endMs).toBe(expectedCurrentEnd);

      const expectedPriorStart = startOfWeek(subWeeks(lastWeekDate, 1), { weekStartsOn: 1 }).getTime();
      const expectedPriorEnd = endOfWeek(subWeeks(lastWeekDate, 1), { weekStartsOn: 1 }).getTime();
      expect(range.prior.startMs).toBe(expectedPriorStart);
      expect(range.prior.endMs).toBe(expectedPriorEnd);
    });
  });

  describe("computeLogMetrics", () => {
    it("computes empty metrics for empty logs", () => {
      const metrics = computeLogMetrics([]);
      expect(metrics).toEqual({
        formsTriggered: 0,
        contactsReached: 0,
      });
    });

    it("computes metrics correctly with contact dedup", () => {
      const logs = [
        { contactEmail: "a@b.com" },
        { contactEmail: "a@b.com" },
        { contactEmail: "c@d.com" },
        { contactEmail: "" }, // missing/empty email
      ];

      const metrics = computeLogMetrics(logs);
      expect(metrics.formsTriggered).toBe(4);
      expect(metrics.contactsReached).toBe(2); // a@b.com and c@d.com
    });
  });

  describe("buildDashboardMetrics", () => {
    it("handles zero prior logs (100% growth or 0%)", () => {
      const current = [
        { contactEmail: "a@b.com" },
      ];
      const prior: LogLike[] = [];
      const metrics = buildDashboardMetrics(
        current, prior,
        1, // activeAgentsTotal
        1, // newAgentsCurrent
        0, // newAgentsPrior
        5, // currentResourcesShared
        0  // priorResourcesShared
      );

      expect(metrics.formsTriggered).toEqual({ value: 1, delta: 1, deltaPct: 100 });
      expect(metrics.activeAgents).toEqual({ value: 1, delta: 1, deltaPct: 100 });
      expect(metrics.contactsReached).toEqual({ value: 1, delta: 1, deltaPct: 100 });
      expect(metrics.resourcesShared).toEqual({ value: 5, delta: 5, deltaPct: 100 });
    });

    it("computes deltas correctly with prior data", () => {
      const current = [
        { contactEmail: "a@b.com" },
        { contactEmail: "c@d.com" },
      ]; // total 2, unique 2
      const prior = [
        { contactEmail: "a@b.com" },
      ]; // total 1, unique 1

      const metrics = buildDashboardMetrics(
        current, prior,
        5, // activeAgentsTotal
        2, // newAgentsCurrent
        4, // newAgentsPrior
        10, // currentResourcesShared
        5   // priorResourcesShared
      );

      expect(metrics.formsTriggered).toEqual({ value: 2, delta: 1, deltaPct: 100 });
      expect(metrics.activeAgents).toEqual({ value: 5, delta: -2, deltaPct: -50 });
      expect(metrics.contactsReached).toEqual({ value: 2, delta: 1, deltaPct: 100 });
      expect(metrics.resourcesShared).toEqual({ value: 10, delta: 5, deltaPct: 100 });
    });
  });

  describe("formatRelativeTime", () => {
    it("formats relative time correctly", () => {
      const now = 1000000000; // arbitrary timestamp

      expect(formatRelativeTime(now, now)).toBe("Just now");
      expect(formatRelativeTime(now - 30 * 60_000, now)).toBe("30m ago");
      expect(formatRelativeTime(now - 2 * 60 * 60_000, now)).toBe("2h ago");
      expect(formatRelativeTime(now - 24 * 60 * 60_000, now)).toBe("Yesterday");
      expect(formatRelativeTime(now - 3 * 24 * 60 * 60_000, now)).toBe("3d ago");
    });
  });

  describe("formatDurationMs", () => {
    it("formats durations correctly", () => {
      expect(formatDurationMs(500)).toBe("500ms");
      expect(formatDurationMs(1500)).toBe("1.5s");
      expect(formatDurationMs(2000)).toBe("2s");
    });
  });
});
