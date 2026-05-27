import { v } from "convex/values";

export const PLATFORM_ROLE = "SUPER_ADMIN";
export const AGENCY_ROLES = ["RD", "MD", "AGENT"] as const;

export const platformRoleValidator = v.literal(PLATFORM_ROLE);
export const agencyRoleValidator = v.union(
  v.literal("RD"),
  v.literal("MD"),
  v.literal("AGENT")
);
export const userRoleValidator = v.union(platformRoleValidator, agencyRoleValidator);
