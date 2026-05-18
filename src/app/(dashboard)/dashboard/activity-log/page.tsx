import { getTenantContext } from "@/lib/tenant";
import { redirect } from "next/navigation";
import { ActivityLogPageClient } from "@/components/activity-log/activity-log-page-client";

export default async function ActivityLogPage() {
  const tenant = await getTenantContext();

  if (!tenant || !tenant.agency) {
    redirect("/pending");
  }

  return <ActivityLogPageClient />;
}
