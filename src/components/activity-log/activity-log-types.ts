import { DateRange } from "react-day-picker";
import { startOfDay, endOfDay } from "date-fns";

export type ActivityLogEntry = {
  id: string;
  submittedAt: string; // ISO
  contactName: string;
  contactEmail: string;
  templateName: string;
  toolName: string;
  success: boolean;
};

export type ActivityLogStatusFilter = "all" | "sent" | "failed";

export type ActivityLogFiltersState = {
  status: ActivityLogStatusFilter;
  search: string;
  dateRange: DateRange | undefined;
};

export function filterActivityLogs(
  logs: ActivityLogEntry[],
  filters: ActivityLogFiltersState
): ActivityLogEntry[] {
  return logs.filter((log) => {
    // Status filter
    if (filters.status === "sent" && !log.success) return false;
    if (filters.status === "failed" && log.success) return false;

    // Search filter
    if (filters.search) {
      const query = filters.search.trim().toLowerCase();
      if (query) {
        const matchName = log.contactName?.toLowerCase().includes(query) ?? false;
        const matchEmail = log.contactEmail?.toLowerCase().includes(query) ?? false;
        if (!matchName && !matchEmail) return false;
      }
    }

    // Date range filter
    if (filters.dateRange) {
      const logDate = new Date(log.submittedAt);
      if (filters.dateRange.from && logDate < startOfDay(filters.dateRange.from)) return false;
      if (filters.dateRange.to && logDate > endOfDay(filters.dateRange.to)) return false;
    }

    return true;
  });
}
