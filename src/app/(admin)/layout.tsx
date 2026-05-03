import { redirect } from "next/navigation";
import { getTenantContext } from "@/lib/tenant";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await getTenantContext();

  if (!tenant || !tenant.user || tenant.user.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950">
      <AdminSidebar tenant={tenant} />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
