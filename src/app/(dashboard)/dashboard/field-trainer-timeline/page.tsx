import { getTenantContext } from "@/lib/tenant";
import { redirect } from "next/navigation";
import { FieldTrainerTimelinePageClient } from "@/components/field-trainer-timeline/field-trainer-timeline-page-client";

export default async function FieldTrainerTimelinePage() {
  const tenant = await getTenantContext();

  if (!tenant || !tenant.agency) {
    redirect("/pending");
  }

  return <FieldTrainerTimelinePageClient />;
}
