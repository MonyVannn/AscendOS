import { auth } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export async function getTenantContext() {
  const { userId, getToken } = await auth();

  let token: string | undefined = undefined;
  // Avoid calling getToken while signed out (already resolves null). During sign-out,
  // Clerk may still report userId briefly while session/token mint fails — treat as anonymous.
  if (userId) {
    try {
      token = (await getToken({ template: "convex" })) ?? undefined;
    } catch {
      token = undefined;
    }
  }

  const tenant = await fetchQuery(
    api.tenant.getTenantContext,
    {},
    { token }
  );

  return tenant;
}

export type TenantContext = NonNullable<Awaited<ReturnType<typeof getTenantContext>>>;
export type AgencyPublic = NonNullable<TenantContext["agency"]>;
