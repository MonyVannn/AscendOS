import { getTenantContext } from "@/lib/tenant";
import { FieldTrainerPageClient } from "@/components/tools/field-trainer-page-client";
import { redirect } from "next/navigation";

export default async function FieldTrainerDripPage() {
  const tenant = await getTenantContext();

  if (!tenant || !tenant.agency) {
    redirect("/pending");
  }

  return (
    <div className="mx-auto max-w-screen-lg py-6 px-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-2">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Field Trainer</h1>
          <p className="text-muted-foreground text-sm max-w-xl">
            Submit an agent to the production drip, reassign their trainer, or reposition them.
          </p>
        </div>
      </div>

      <FieldTrainerPageClient user={tenant.user} agency={tenant.agency} />
    </div>
  );
}
