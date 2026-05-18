import { ActivityLogEntry } from "./activity-log-types";

export const MOCK_ACTIVITY_LOGS: ActivityLogEntry[] = [
  {
    id: "1",
    submittedAt: "2026-05-18T14:38:00Z",
    contactName: "Sarah Johnson",
    contactEmail: "sarah@example.com",
    templateName: "Recruit-Career Overview Email",
    toolName: "Email Template",
    success: true
  },
  {
    id: "2",
    submittedAt: "2026-05-18T11:12:00Z",
    contactName: "Mike Torres",
    contactEmail: "mike@example.com",
    templateName: "Bus. Follow-Up",
    toolName: "Email Template",
    success: false
  },
  {
    id: "3",
    submittedAt: "2026-05-17T09:45:00Z",
    contactName: "Emily Chen",
    contactEmail: "emily.chen@example.com",
    templateName: "Welcome Series - Day 1",
    toolName: "Email Template",
    success: true
  },
  {
    id: "4",
    submittedAt: "2026-05-16T16:20:00Z",
    contactName: "David Smith",
    contactEmail: "david.smith@example.com",
    templateName: "Meeting Reminder",
    toolName: "Email Template",
    success: true
  },
  {
    id: "5",
    submittedAt: "2026-05-15T13:05:00Z",
    contactName: "Jessica Wong",
    contactEmail: "jessica.w@example.com",
    templateName: "Monthly Newsletter",
    toolName: "Email Template",
    success: false
  },
  {
    id: "6",
    submittedAt: "2026-05-14T10:30:00Z",
    contactName: "Robert Taylor",
    contactEmail: "robert.t@example.com",
    templateName: "Product Update",
    toolName: "Email Template",
    success: true
  },
  {
    id: "7",
    submittedAt: "2026-05-13T15:55:00Z",
    contactName: "Amanda Davis",
    contactEmail: "amanda.d@example.com",
    templateName: "Feedback Request",
    toolName: "Email Template",
    success: true
  },
  {
    id: "8",
    submittedAt: "2026-05-12T08:15:00Z",
    contactName: "James Wilson",
    contactEmail: "james.w@example.com",
    templateName: "Account Setup",
    toolName: "Email Template",
    success: false
  }
];
