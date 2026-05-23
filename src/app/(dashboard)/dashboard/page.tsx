import { getTenantContext } from "@/lib/tenant";
import { DashboardPageClient } from "@/components/dashboard/dashboard-page-client";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const tenant = await getTenantContext();

  if (!tenant || !tenant.agency) {
    redirect("/pending");
  }

  return <DashboardPageClient tenant={tenant} />;
}
