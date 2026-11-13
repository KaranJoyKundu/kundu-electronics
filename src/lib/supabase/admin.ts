import "server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * Privileged client for trusted server-side jobs only.
 * Never import this module from a Client Component or expose its key to the browser.
 */
export function createAdminSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) return null;

  return createClient(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: { "X-Client-Info": "kundu-electronics/server-admin" },
    },
  });
}
