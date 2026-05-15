/**
 * Permissive Supabase Database type — fully untyped until we generate real
 * types from the live schema via `npm run supabase:types` post-MVP.
 *
 * Using `any` here means Supabase queries return `any`, which loses some
 * column-level type safety but unblocks strict `tsc -b` builds. The rest of
 * the codebase still gets type safety from the explicit `DwpLevel`,
 * `DwpProgress`, etc. interfaces in `src/types/dwp.ts`, which we cast to
 * at the call sites that matter (e.g. `data as DwpLevel[]`).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Database = any
