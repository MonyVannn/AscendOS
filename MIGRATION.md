# Features Schema Migration

This migration involves a two-phase deployment because Convex schema pushes are atomic.

## Phase A (Deploy 1)
1. Deploy the changes where `features` and `agencyFeatures` are added to `convex/schema.ts`, and `agencies.featuresArray` is made `v.optional(v.array(v.string()))`.
2. Run the seed registry mutation to populate global features:
   ```bash
   npx convex run seed:seedFeatureRegistry
   ```
3. Run the backfill script to migrate existing agency data:
   ```bash
   npx convex run seed:backfillAgencyFeaturesFromLegacy
   ```

## Phase B (Deploy 2)
1. Once backfill is confirmed, remove `featuresArray` from `convex/schema.ts` completely.
2. Deploy the final code.