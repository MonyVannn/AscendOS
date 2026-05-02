import { auth } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export async function getTenantContext() {
  const { getToken } = await auth();

  let token: string | undefined = undefined;
  try {
    token = (await getToken({ template: "convex" })) ?? undefined;
  } catch (error) {
    console.error("Failed to fetch Clerk JWT for Convex. Ensure the 'convex' JWT template is created in the Clerk Dashboard.", error);
  }

  const tenant = await fetchQuery(
    api.tenant.getTenantContext,
    {},
    { token }
  );

  return tenant;
}

export type TenantContext = NonNullable<Awaited<ReturnType<typeof getTenantContext>>>;
export type AgencyPublic = TenantContext["agency"];
