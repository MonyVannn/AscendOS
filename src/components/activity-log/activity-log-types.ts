import { DateRange } from "react-day-picker";

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
