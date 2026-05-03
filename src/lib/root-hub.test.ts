import { describe, expect, it } from "vitest";
import type { Id } from "@/convex/_generated/dataModel";
import type { TenantContext } from "@/lib/tenant";
import { resolveRootHubPath } from "@/lib/root-hub";

const userId = "jd7abc123xyz" as Id<"users">;
const agencyId = "kq9abc456xyz" as Id<"agencies">;

/** Sanitized agency shape matches `convex/tenant.ts` omit of ghl secrets */
function makeSanitizedAgency(overrides: Partial<TenantContext["agency"]>): NonNullable<TenantContext["agency"]> {
  return {
    _id: agencyId,
    _creationTime: 1700000000,
    name: "Acme",
    slug: "acme",
    featuresArray: [],
    createdAt: 1700000000,
    ...overrides,
  } as NonNullable<TenantContext["agency"]>;
}

function makeTenant(parts: {
  agency: TenantContext["agency"];
  user?: TenantContext["user"];
  theme?: TenantContext["theme"];
}): TenantContext {
  return {
    theme: parts.theme ?? null,
    agency: parts.agency,
    user:
      parts.user ??
      ({
        _id: userId,
        _creationTime: 1700000000,
        clerkId: "user_clerk_test",
        agencyId: null,
      } as TenantContext["user"]),
  };
}

describe("resolveRootHubPath", () => {
  it('returns "/pending" when tenant is null (Convex/sync not ready)', () => {
    expect(resolveRootHubPath(null)).toBe("/pending");
  });

  it('returns "/admin" when user is SUPER_ADMIN (even without agency)', () => {
    const tenant = makeTenant({
      agency: null,
      user: {
        _id: userId,
        _creationTime: 1700000000,
        clerkId: "user_clerk_test",
        agencyId: null,
        role: "SUPER_ADMIN",
      } as TenantContext["user"],
    });
    expect(resolveRootHubPath(tenant)).toBe("/admin");
  });

  it('returns "/pending" when not superadmin and no agency', () => {
    const tenant = makeTenant({
      agency: null,
      user: {
        _id: userId,
        _creationTime: 1700000000,
        clerkId: "user_clerk_test",
        agencyId: null,
        role: "RD",
      } as TenantContext["user"],
    });
    expect(resolveRootHubPath(tenant)).toBe("/pending");
  });

  it('returns "/dashboard" when agency is present', () => {
    const agency = makeSanitizedAgency({ _id: agencyId });
    const tenant = makeTenant({
      agency,
      user: {
        _id: userId,
        _creationTime: 1700000000,
        clerkId: "user_clerk_test",
        agencyId,
      } as TenantContext["user"],
    });
    expect(resolveRootHubPath(tenant)).toBe("/dashboard");
  });
});
