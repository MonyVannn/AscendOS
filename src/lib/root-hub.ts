import type { TenantContext } from "@/lib/tenant";

/**
 * Mirrors root hub spec ordering: null tenant → pending; SUPER_ADMIN → admin;
 * no agency → pending; else dashboard.
 */
export function resolveRootHubPath(
  tenant: TenantContext | null
): "/pending" | "/admin" | "/dashboard" {
  if (!tenant) {
    return "/pending";
  }
  if (tenant.user?.role === "SUPER_ADMIN") {
    return "/admin";
  }
  if (!tenant.agency) {
    return "/pending";
  }
  return "/dashboard";
}
