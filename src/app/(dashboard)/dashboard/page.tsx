import { getTenantContext } from "@/lib/tenant";

export default async function DashboardPage() {
  const tenant = await getTenantContext();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Welcome to your Dashboard</h2>
      <p>Your agency: {tenant?.agency.name}</p>
      {tenant?.agency.featuresArray && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Features:</h3>
          <pre className="bg-gray-100 p-2 rounded mt-2 text-sm">
            {JSON.stringify(tenant.agency.featuresArray, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
