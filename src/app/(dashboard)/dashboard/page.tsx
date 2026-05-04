import { getTenantContext } from "@/lib/tenant";

export default async function DashboardPage() {
  const tenant = await getTenantContext();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Welcome to your Dashboard</h2>
      <p>Your agency: {tenant?.agency?.name}</p>
      {tenant?.enabledFeatures && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Features:</h3>
          <ul className="list-disc pl-5 mt-2">
            {tenant.enabledFeatures.map((f) => (
              <li key={f.key}>
                <strong>{f.label}</strong> ({f.type})
                {f.href && <span> - <a href={f.href} className="text-blue-600 hover:underline">{f.href}</a></span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
