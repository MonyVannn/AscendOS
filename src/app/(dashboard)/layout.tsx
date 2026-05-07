import { redirect } from "next/navigation";
import { getTenantContext } from "@/lib/tenant";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { getAgencyThemeCssVars } from "@/lib/agency-theme-css-vars";
import packageJson from "../../../package.json";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await getTenantContext();

  if (!tenant) {
    redirect("/pending");
  }

  if (tenant.user?.role === "SUPER_ADMIN") {
    redirect("/admin");
  }

  if (!tenant.agency) {
    redirect("/pending");
  }

  const themeVars = getAgencyThemeCssVars(tenant.theme);

  return (
    <div className="flex h-screen flex-col" style={themeVars}>
      <DashboardHeader tenant={tenant} appVersion={packageJson.version} />
      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar tenant={tenant} appVersion={packageJson.version} />
        <main className="flex-1 overflow-y-auto p-4 bg-muted/20">
          {children}
        </main>
      </div>
    </div>
  );
}

