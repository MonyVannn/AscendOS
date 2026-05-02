import { redirect } from "next/navigation";
import { getTenantContext } from "@/lib/tenant";

export default async function PendingPage() {
  const tenant = await getTenantContext();

  if (!tenant) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Setting up your account...</h1>
          <p className="text-gray-600">Please wait a moment while we sync your details.</p>
        </div>
      </div>
    );
  }

  if (tenant.user?.role === "SUPER_ADMIN") {
    redirect("/admin");
  }

  if (tenant.agency) {
    redirect("/dashboard");
  }

  return (
    <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="max-w-md p-8 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 text-center">
        <h1 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">Account Pending</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Your account has been created, but you haven&apos;t been assigned to an agency yet.
          Please contact your administrator to complete your onboarding.
        </p>
      </div>
    </div>
  );
}
