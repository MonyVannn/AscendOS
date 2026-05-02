import { redirect } from "next/navigation";
import { getTenantContext } from "@/lib/tenant";

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
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="border-b bg-white dark:bg-zinc-900 px-6 py-4">
        <h1 className="text-xl font-bold">Admin Console</h1>
      </header>
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}
