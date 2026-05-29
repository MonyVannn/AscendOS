import { AdminWebhookLogsClient } from "@/components/admin/webhook-logs/admin-webhook-logs-client";

export const metadata = {
  title: "Webhook Logs | AscendOS Admin",
};

export default function AdminWebhooksPage() {
  return <AdminWebhookLogsClient />;
}
