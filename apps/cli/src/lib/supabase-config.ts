// Publishable key is safe to hardcode (public by design).
// Both can be overridden with env vars for local testing.
export const SUPABASE_URL =
  (process.env.SUPABASE_URL ?? '').replace(/\/$/, '') ||
  'https://fdzlalvfqhefnsgvmeby.supabase.co';

export const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ??
  process.env.SUPABASE_PUBLISHABLE_KEY ??
  'sb_publishable_L3927rknhsyTb_4_IkQInA_9TYk39FH';
