import { describe, it, expect } from "vitest";
import {
  getPeriodRange,
  computeMetricsFromLogs,
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

  describe("computeMetricsFromLogs", () => {
    it("computes empty metrics for empty logs", () => {
      const metrics = computeMetricsFromLogs([]);
      expect(metrics).toEqual({
        formsTriggered: 0,
        agentsTouched: 0,
        avgFireTimeMs: 0,
        successRate: 0,
      });
    });

    it("computes metrics correctly", () => {
      const logs = [
        { userId: "u1", success: true, latencyMs: 200 },
        { userId: "u1", success: true, latencyMs: 300 },
        { userId: "u2", success: false, latencyMs: null }, // no latency
        { userId: "u3", success: true, latencyMs: 400 },
      ];

      const metrics = computeMetricsFromLogs(logs);
      expect(metrics.formsTriggered).toBe(4);
      expect(metrics.agentsTouched).toBe(3); // u1, u2, u3
      expect(metrics.avgFireTimeMs).toBe(300); // (200+300+400)/3
      expect(metrics.successRate).toBe(75); // 3/4
    });
  });

  describe("buildDashboardMetrics", () => {
    it("handles zero prior logs (100% growth or 0%)", () => {
      const current = [
        { userId: "u1", success: true, latencyMs: 200 },
      ];
      const prior: LogLike[] = [];
      const metrics = buildDashboardMetrics(current, prior);

      expect(metrics.formsTriggered).toEqual({ value: 1, delta: 1, deltaPct: 100 });
      expect(metrics.agentsTouched).toEqual({ value: 1, delta: 1, deltaPct: 100 });
      expect(metrics.avgFireTimeMs).toEqual({ value: 200, delta: 200, deltaPct: 100 });
      expect(metrics.successRate).toEqual({ value: 100, delta: 100, deltaPct: 100 });
    });

    it("computes deltas correctly with prior data", () => {
      const current = [
        { userId: "u1", success: true, latencyMs: 400 },
        { userId: "u2", success: false, latencyMs: 200 },
      ]; // total 2, agents 2, avg latency 300, success 50
      const prior = [
        { userId: "u1", success: true, latencyMs: 200 },
      ]; // total 1, agents 1, avg latency 200, success 100

      const metrics = buildDashboardMetrics(current, prior);

      expect(metrics.formsTriggered).toEqual({ value: 2, delta: 1, deltaPct: 100 });
      expect(metrics.agentsTouched).toEqual({ value: 2, delta: 1, deltaPct: 100 });
      expect(metrics.avgFireTimeMs).toEqual({ value: 300, delta: 100, deltaPct: 50 });
      expect(metrics.successRate).toEqual({ value: 50, delta: -50, deltaPct: -50 });
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
