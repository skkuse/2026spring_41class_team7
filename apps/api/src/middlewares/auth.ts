/**
 * Validates `Authorization: Bearer <access_token>` using Supabase Auth.
 * Use the same JWT the Next.js app gets from `session.access_token` (see SupabaseAuthBridge).
 */
import { createClient } from '@supabase/supabase-js';
import type { MiddlewareHandler } from 'hono';

import type { Env } from '../types.js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false },
      })
    : null;

export const requireAuth: MiddlewareHandler<Env> = async (c, next) => {
  if (!supabase) {
    return c.json({ message: 'Supabase auth is not configured on the server.' }, 500);
  }

  const authHeader = c.req.header('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return c.json({ message: 'Missing bearer token.' }, 401);
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return c.json({ message: 'Unauthorized token.' }, 401);
  }

  c.set('userId', data.user.id);
  await next();
};
