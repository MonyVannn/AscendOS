# Provisioning and Onboarding

This document outlines the first-time setup for the platform.

## Bootstrapping the Platform

When you deploy a new instance, you need to create the first agency and the first Super Admin.

1. **Seed the First Agency:**
   Run the `bootstrapAgency` mutation from the Convex dashboard to create "Divinity Group":
   ```
   npx convex run seed:bootstrapAgency
   ```

2. **Sign Up the First User:**
   Log into the application via Clerk. Clerk will trigger the webhook and create an unprovisioned `users` record in Convex.

3. **Promote the First User to Super Admin:**
   Find the user's `clerkId` from the Clerk Dashboard (or Convex `users` table). Run the `promoteFirstUserToSuperAdmin` mutation:
   ```
   npx convex run seed:promoteFirstUserToSuperAdmin '{"clerkId": "user_2..."}'
   ```
   *Note: This mutation sets the user as a global Super Admin and removes any agency association, as Super Admins oversee all agencies.*

From this point forward, the Super Admin can use the `/admin/assign` page to provision any subsequent users that sign up. Additional Super Admins can be promoted manually using the same mutation.

## Agency GHL field migration (legacy data)

If `convex dev` fails with schema errors on `agencies` (e.g. documents still using `ghlApiKey` instead of `ghlAccessToken` / `ghlLocationId`), push the current schema, then run the internal backfill once:

```bash
npx convex run seed:backfillAgencyGhlFields
```

After it reports success, restart `npx convex dev` if needed. This copies `ghlApiKey` → `ghlAccessToken`, sets `ghlLocationId` to `""` when missing, and removes the legacy field.
