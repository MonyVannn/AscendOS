import { getTenantContext } from "@/lib/tenant";
import { RemoveAgentForm } from "@/components/tools/remove-agent-form";
import { redirect } from "next/navigation";

export default async function RemoveAgentPage() {
  const tenant = await getTenantContext();

  if (!tenant || !tenant.agency) {
    redirect("/pending");
  }

  return (
    <div className="mx-auto max-w-screen-lg py-6 px-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-2">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Remove Agent</h1>
          <p className="text-muted-foreground text-sm max-w-xl">
            Permanently remove an agent from GoHighLevel automations and contacts.
          </p>
        </div>
      </div>

      <div className="mt-6 bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <RemoveAgentForm agency={tenant.agency} />
      </div>
    </div>
  );
}
