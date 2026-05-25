import { getTenantContext } from "@/lib/tenant";
import { redirect } from "next/navigation";
import { ResourceHubPageClient } from "@/components/resource-hub/resource-hub-page-client";

export default async function ResourceHubPage() {
  const ctx = await getTenantContext();
  
  if (!ctx?.agency?._id) {  // If no agency, redirect to pending page
    redirect("/dashboard");
  }
  
  return <ResourceHubPageClient />;
}
