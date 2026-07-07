import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { resolveRootHubPath } from "@/lib/root-hub";
import { getTenantContext } from "@/lib/tenant";
import { LandingPage } from "@/components/landing/landing-page";

export default async function Home() {
  const { userId } = await auth();
  
  if (userId) {
    const tenant = await getTenantContext();
    redirect(resolveRootHubPath(tenant));
  }
  
  return <LandingPage />;
}
