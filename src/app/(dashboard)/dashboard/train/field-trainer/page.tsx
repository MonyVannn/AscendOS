import { getTenantContext } from "@/lib/tenant";
import { FieldTrainerDripForm } from "@/components/tools/field-trainer-drip-form";
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Field Trainer Drip</h1>
          <p className="text-muted-foreground text-sm max-w-xl">
            Submit an agent to the production drip — assigns trainer and auto-starts Quick Start Drip.
          </p>
        </div>
      </div>

      <div className="mt-6 bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <FieldTrainerDripForm user={tenant.user} agency={tenant.agency} />
      </div>
    </div>
  );
}
