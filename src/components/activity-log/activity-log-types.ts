export type ActivityLogEntry = {
  id: string;
  submittedAt: string; // ISO
  contactName: string;
  contactEmail: string;
  templateName: string;
  toolName: string;
  success: boolean;
};
