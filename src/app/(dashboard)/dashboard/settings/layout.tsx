import { getTenantContext } from "@/lib/tenant";
import { redirect } from "next/navigation";
import { SettingsShell } from "@/components/settings/settings-shell";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await getTenantContext();

  if (!tenant || !tenant.agency) {
    redirect("/pending");
  }

  return <SettingsShell tenant={tenant}>{children}</SettingsShell>;
}
