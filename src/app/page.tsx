import { redirect } from "next/navigation";
import { resolveRootHubPath } from "@/lib/root-hub";
import { getTenantContext } from "@/lib/tenant";

export default async function Home() {
  const tenant = await getTenantContext();
  redirect(resolveRootHubPath(tenant));
}
