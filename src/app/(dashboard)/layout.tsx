import { redirect } from "next/navigation";
import { getTenantContext } from "@/lib/tenant";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await getTenantContext();

  if (!tenant) {
    // Temporary redirect until /pending is implemented
    redirect("/");
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="border-b p-4">
        <h1 className="text-xl font-bold">{tenant.agency.name}</h1>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 border-r p-4 hidden md:block">
          <nav>
            <ul>
              <li>
                <a href="/dashboard" className="block p-2 hover:bg-gray-100 rounded">
                  Dashboard
                </a>
              </li>
            </ul>
          </nav>
        </aside>
        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
