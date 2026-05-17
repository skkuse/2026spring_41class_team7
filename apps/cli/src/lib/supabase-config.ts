// Replace these with your actual Supabase project values before publishing.
// The anon key is intentionally public — it is safe to hardcode.
// Both can be overridden with env vars for local testing.
export const SUPABASE_URL =
  (process.env.SUPABASE_URL ?? '').replace(/\/$/, '') ||
  'https://YOUR_PROJECT_REF.supabase.co';

export const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ?? 'YOUR_SUPABASE_ANON_KEY';
