/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activityLog from "../activityLog.js";
import type * as admin from "../admin.js";
import type * as dashboard from "../dashboard.js";
import type * as featureRegistry from "../featureRegistry.js";
import type * as features from "../features.js";
import type * as ghlInbound from "../ghlInbound.js";
import type * as http from "../http.js";
import type * as seed from "../seed.js";
import type * as settings from "../settings.js";
import type * as tenant from "../tenant.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activityLog: typeof activityLog;
  admin: typeof admin;
  dashboard: typeof dashboard;
  featureRegistry: typeof featureRegistry;
  features: typeof features;
  ghlInbound: typeof ghlInbound;
  http: typeof http;
  seed: typeof seed;
  settings: typeof settings;
  tenant: typeof tenant;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
