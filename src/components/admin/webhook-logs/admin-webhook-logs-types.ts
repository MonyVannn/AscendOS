import { DateRange } from "react-day-picker";

export type AdminWebhookLogEntry = {
  _id: string;
  submittedAt: string; // ISO
  contactName: string;
  contactEmail: string;
  templateName: string;
  toolName: string;
  success: boolean;
  errorMessage?: string;
  latencyMs?: number;
  retried?: boolean;
  agencyId: string;
  agencyName: string;
  agencySlug: string;
  userId: string;
  userName: string;
};

export type AdminWebhookLogStatusFilter = "all" | "sent" | "failed";
