import { getTenantContext } from "@/lib/tenant";
import { SendEmailTemplateForm } from "@/components/tools/send-email-template-form";
import { redirect } from "next/navigation";

export default async function SendEmailTemplatePage() {
  const tenant = await getTenantContext();

  if (!tenant || !tenant.agency) {
    redirect("/pending");
  }

  return (
    <div className="mx-auto max-w-screen-lg py-6 px-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-2">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Send Email Template</h1>
          <p className="text-muted-foreground text-sm max-w-xl">
            Pick a template and we&apos;ll dispatch it through GoHighLevel from your agent identity. Tracked in your activity feed.
          </p>
        </div>
        <div className="shrink-0 mt-1 sm:mt-0 pt-1">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            12 templates available
          </span>
        </div>
      </div>

      <div className="mt-6 bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <SendEmailTemplateForm user={tenant.user} agency={tenant.agency} />
      </div>
    </div>
  );
}
