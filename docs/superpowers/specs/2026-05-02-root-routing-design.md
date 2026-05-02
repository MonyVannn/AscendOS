# Root routing and entry behavior — design spec

**Date:** 2026-05-02  
**Status:** Approved for implementation planning  
**Scope:** Remove the public marketing route at `/`; make `/` the authenticated entry hub; align middleware and layouts; keep `/sign-in` as the Clerk sign-in surface.

## Goals

- There is **no** default public landing page at `/`.
- **Signed-out** users attempting to use app entry routes are sent to **`/sign-in`** (embedded Clerk `<SignIn />`; env must match this path).
- **Signed-in** users hitting **`/`** are routed by **tenant context**:
  - **Super admin** → **`/admin`**
  - **No agency** (and not resolved as super admin in the branch order below) → **`/pending`**
  - **Has agency** (normal user) → **`/dashboard`**
- **Convex / tenant not ready yet** (`getTenantContext()` returns `null`) → **`/pending`** (existing “setting up your account” UX).

Non-goals: changing Convex schema, admin or dashboard feature work, or redesigning pending/admin UI.

## Current state (baseline)

- **`/`** — Create Next App–style public page with Clerk modal sign-in.
- **`src/middleware.ts`** — `auth.protect()` only for `/dashboard` and `/admin`; **`/`** and **`/pending`** are not protected.
- **`(dashboard)/layout.tsx`** — Enforces tenant rules; **`!tenant`** redirects to **`/`** (conflicts with hub-at-root once `/` is redirect-only).
- **`pending/page.tsx`** — Handles null tenant (loading), superadmin → `/admin`, agency → `/dashboard`, else pending copy.
- **`(admin)/layout.tsx`** — Non-superadmin → **`/dashboard`**.

## Target behavior

### Middleware

- Treat these paths as **authenticated** (same mechanism as today: `createRouteMatcher` + `auth.protect()`):
  - **`/`**
  - **`/dashboard(.*)`**
  - **`/admin(.*)`**
  - **`/pending(.*)`**
- Do **not** protect **`/sign-in`** (and **`/sign-up`** if present) so Clerk can render sign-in.
- Preserve existing matcher `config` for static assets and API routes.

If future routes are added that require auth, either extend the matcher list or (separate effort) switch to a public-route allowlist.

### Root page `src/app/page.tsx`

Replace the marketing UI with a **server-only redirect hub**:

1. Call **`getTenantContext()`** (Clerk session is already established for this request via middleware).
2. **`if (!tenant)`** → **`redirect("/pending")`**.
3. **`if (tenant.user?.role === "SUPER_ADMIN")`** → **`redirect("/admin")`**.
4. **`if (!tenant.agency)`** → **`redirect("/pending")`**.
5. Else → **`redirect("/dashboard")`**.

No client flash content required for v1; redirects are sufficient.

### Dashboard layout `src/app/(dashboard)/layout.tsx`

- Change **`if (!tenant) redirect("/")`** to **`redirect("/pending")`** so users without Convex tenant context are not sent back to **`/`** (avoids redundant hub hop and matches pending’s sync state).

All other branches in that layout (superadmin → admin, no agency → pending) remain as today unless implementation review shows redundancy with the hub.

### Clerk configuration

- Ensure a dedicated **`/sign-in`** route exists with Clerk **`<SignIn />`** (catch-all segment pattern per Clerk Next.js App Router docs for this project’s Clerk version).
- Set env vars so sign-in and post-auth redirects are consistent, e.g.:
  - Sign-in URL points at **`/sign-in`**.
  - After sign-in, prefer redirect to **`/`** so **one** centralized hub applies role/agency routing. Use the Clerk + Next.js–appropriate variables for this codebase (names differ slightly by version; verify against `node_modules` / Clerk docs vendored in the project).

**Note:** At spec time, the repo only referenced a modal on **`/`**; if **`/sign-in`** is not yet in tree, implementation adds it and documents env in `.env.example` only (not secrets).

### Security / UX notes

- **Direct `/pending` while signed out** → middleware → Clerk sign-in flow (fixes today’s open **`/pending`**).
- Deep links to **`/dashboard`** or **`/admin`** continue to rely on existing layout checks after auth.

## Testing checklist (manual)

| Case | Expected |
|------|----------|
| Signed out, GET `/` | Redirect to sign-in (Clerk) |
| Signed out, GET `/pending` | Redirect to sign-in |
| Signed in, superadmin, GET `/` | `/admin` |
| Signed in, no agency (non-superadmin), GET `/` | `/pending` |
| Signed in, has agency, GET `/` | `/dashboard` |
| Signed in, tenant null (sync), GET `/` | `/pending` (loading UX) |
| After sign-in | Land on `/` or equivalent so hub runs (per env config) |

## Implementation follow-up

After this spec is accepted, use the **writing-plans** skill to produce a step-by-step implementation plan (files, middleware diff, Clerk env touchpoints, manual test pass).

## Spec self-review

- **Placeholders:** None; Clerk env names are intentionally version-verified in implementation.
- **Consistency:** Hub order matches dashboard layout priority (superadmin before agency check; null tenant → pending).
- **Scope:** Single slice (routing/middleware/root/layout/Clerk entry); no schema changes.
- **Ambiguity:** Superadmin with no agency still matches **`SUPER_ADMIN`** first → **`/admin`** (aligned with existing **`pending/page.tsx`** behavior).
