import { createClient } from '@supabase/supabase-js';

function loadServerEnv() {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  let serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    // Load dotenv at runtime if env vars are not already present.
    // This avoids static top-level filesystem imports that Turbopack may trace.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { config } = require('dotenv');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { resolve } = require('node:path');

    for (const envFile of ['.env.local', '.env']) {
      config({ path: resolve(process.cwd(), envFile) });
    }

    url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  }

  return { url, serviceRoleKey };
}

/**
 * Server-only Supabase client using the service role key.
 * Bypasses RLS — always validate Clerk ownership in server actions before use.
 */
export function createAdminClient() {
  const { url, serviceRoleKey } = loadServerEnv();

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for server database access.'
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function createAdminClientOrNull() {
  const { url, serviceRoleKey } = loadServerEnv();

  if (!url || !serviceRoleKey) {
    return null;
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
