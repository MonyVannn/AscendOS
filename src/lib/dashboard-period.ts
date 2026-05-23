import {
  endOfWeek,
  startOfWeek,
  subWeeks,
  format,
} from "date-fns";

export type DashboardPeriod = "this_week" | "last_week";

export type PeriodBounds = {
  startMs: number;
  endMs: number;
};

export type DashboardPeriodRange = {
  current: PeriodBounds;
  prior: PeriodBounds;
  label: string;
};

export function getPeriodRange(
  period: DashboardPeriod,
  referenceDate: Date = new Date()
): DashboardPeriodRange {
  const weekStartsOn = 1 as const; // Monday

  if (period === "this_week") {
    const currentStart = startOfWeek(referenceDate, { weekStartsOn });
    const currentEnd = endOfWeek(referenceDate, { weekStartsOn });
    const priorStart = startOfWeek(subWeeks(referenceDate, 1), { weekStartsOn });
    const priorEnd = endOfWeek(subWeeks(referenceDate, 1), { weekStartsOn });

    return {
      current: { startMs: currentStart.getTime(), endMs: currentEnd.getTime() },
      prior: { startMs: priorStart.getTime(), endMs: priorEnd.getTime() },
      label: "This week",
    };
  }

  const lastWeekRef = subWeeks(referenceDate, 1);
  const currentStart = startOfWeek(lastWeekRef, { weekStartsOn });
  const currentEnd = endOfWeek(lastWeekRef, { weekStartsOn });
  const priorStart = startOfWeek(subWeeks(lastWeekRef, 1), { weekStartsOn });
  const priorEnd = endOfWeek(subWeeks(lastWeekRef, 1), { weekStartsOn });

  return {
    current: { startMs: currentStart.getTime(), endMs: currentEnd.getTime() },
    prior: { startMs: priorStart.getTime(), endMs: priorEnd.getTime() },
    label: "Last week",
  };
}

export type WebhookLogMetrics = {
  formsTriggered: number;
  agentsTouched: number;
  avgFireTimeMs: number;
  successRate: number;
};

export type MetricWithDelta = {
  value: number;
  delta: number;
  deltaPct: number;
};

export type DashboardMetrics = {
  formsTriggered: MetricWithDelta;
  agentsTouched: MetricWithDelta;
  avgFireTimeMs: MetricWithDelta;
  successRate: MetricWithDelta;
};

export type LogLike = {
  userId: string;
  success: boolean;
  latencyMs?: number | null;
};

export function computeMetricsFromLogs(logs: LogLike[]): WebhookLogMetrics {
  const total = logs.length;
  const successCount = logs.filter((l) => l.success).length;
  const uniqueUsers = new Set(logs.map((l) => l.userId)).size;
  const latencies = logs
    .filter((l) => l.latencyMs != null)
    .map((l) => l.latencyMs as number);
  const avgLatency =
    latencies.length > 0
      ? latencies.reduce((sum, ms) => sum + ms, 0) / latencies.length
      : 0;
  const successRate = total > 0 ? (successCount / total) * 100 : 0;

  return {
    formsTriggered: total,
    agentsTouched: uniqueUsers,
    avgFireTimeMs: Math.round(avgLatency),
    successRate: Math.round(successRate * 10) / 10,
  };
}

export function withDelta(current: number, prior: number): MetricWithDelta {
  const delta = current - prior;
  const deltaPct =
    prior === 0 ? (current > 0 ? 100 : 0) : Math.round((delta / prior) * 100);
  return { value: current, delta, deltaPct };
}

export function buildDashboardMetrics(
  currentLogs: LogLike[],
  priorLogs: LogLike[]
): DashboardMetrics {
  const current = computeMetricsFromLogs(currentLogs);
  const prior = computeMetricsFromLogs(priorLogs);

  return {
    formsTriggered: withDelta(current.formsTriggered, prior.formsTriggered),
    agentsTouched: withDelta(current.agentsTouched, prior.agentsTouched),
    avgFireTimeMs: withDelta(current.avgFireTimeMs, prior.avgFireTimeMs),
    successRate: withDelta(current.successRate, prior.successRate),
  };
}

export function formatGreetingDate(date: Date = new Date()): string {
  return format(date, "EEE, MMM d · h:mmaaa").replace(/AM|PM/, (m) =>
    m.toLowerCase()
  );
}

export function formatRelativeTime(timestampMs: number, nowMs: number): string {
  const diffMs = nowMs - timestampMs;
  if (diffMs < 0) return "Just now"; // Handle slight future timestamps safely
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return format(new Date(timestampMs), "MMM d");
}

export function formatDurationMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.round(ms / 100) / 10;
  return `${seconds}s`;
}
