import { getTenantContext } from "@/lib/tenant";
import { BeastModeDripForm } from "@/components/tools/beast-mode-drip-form";
import { redirect } from "next/navigation";

export default async function BeastModeDripPage() {
  const tenant = await getTenantContext();

  if (!tenant || !tenant.agency) {
    redirect("/pending");
  }

  return (
    <div className="mx-auto max-w-screen-lg py-6 px-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-2">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Beast Mode Drip
          </h1>
          <p className="text-muted-foreground text-sm max-w-xl">
            Submit a new hire to the Beast Mode and Quick Start drip sequence in GoHighLevel.
          </p>
        </div>
      </div>

      <div className="mt-6 bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <BeastModeDripForm agency={tenant.agency} />
      </div>
    </div>
  );
}
