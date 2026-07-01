export const PLATFORM_ROLE = "SUPER_ADMIN";
export const AGENCY_ROLES = ["RD", "MD", "AGENT"] as const;

export type PlatformRole = typeof PLATFORM_ROLE;
export type AgencyRole = typeof AGENCY_ROLES[number];
export type UserRole = PlatformRole | AgencyRole;

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  RD: "Regional Director",
  MD: "Market Director",
  AGENT: "Agent",
};

export function isAgencyRole(role?: string | null): role is AgencyRole {
  return AGENCY_ROLES.includes(role as AgencyRole);
}

export function isDashboardRole(role?: string | null): role is AgencyRole {
  // For now, all agency roles get dashboard access
  return isAgencyRole(role);
}

export function canUseAgencyTheme(role?: string | null): boolean {
  return isAgencyRole(role);
}
