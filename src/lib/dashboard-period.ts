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

export type LogMetrics = {
  formsTriggered: number;
  contactsReached: number;
};

export type MetricWithDelta = {
  value: number;
  delta: number;
  deltaPct: number;
};

export type DashboardMetrics = {
  formsTriggered: MetricWithDelta;
  activeAgents: MetricWithDelta;
  contactsReached: MetricWithDelta;
  resourcesShared: MetricWithDelta;
};

export type LogLike = {
  contactEmail: string;
};

export function computeLogMetrics(logs: LogLike[]): LogMetrics {
  const total = logs.length;
  const uniqueContacts = new Set(logs.map((l) => l.contactEmail).filter(Boolean)).size;

  return {
    formsTriggered: total,
    contactsReached: uniqueContacts,
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
  priorLogs: LogLike[],
  activeAgentsTotal: number,
  newAgentsCurrent: number,
  newAgentsPrior: number,
  currentResourcesShared: number,
  priorResourcesShared: number
): DashboardMetrics {
  const current = computeLogMetrics(currentLogs);
  const prior = computeLogMetrics(priorLogs);

  const agentsDelta = newAgentsCurrent - newAgentsPrior;
  const agentsDeltaPct =
    newAgentsPrior === 0 ? (newAgentsCurrent > 0 ? 100 : 0) : Math.round((agentsDelta / newAgentsPrior) * 100);

  return {
    formsTriggered: withDelta(current.formsTriggered, prior.formsTriggered),
    activeAgents: { value: activeAgentsTotal, delta: agentsDelta, deltaPct: agentsDeltaPct },
    contactsReached: withDelta(current.contactsReached, prior.contactsReached),
    resourcesShared: withDelta(currentResourcesShared, priorResourcesShared),
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
