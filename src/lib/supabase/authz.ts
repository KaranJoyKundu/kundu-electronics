import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export type StoreRole = "admin" | "staff";

export interface StorePrincipal {
  id: string;
  email: string | null;
  role: StoreRole;
}

/** Authentication is verified with Supabase Auth; role is read from the protected DB profile. */
export async function getStorePrincipal(): Promise<StorePrincipal | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const { data: authData, error: authError } = await supabase.auth.getUser();
  const user = authData.user;
  if (authError || !user) return null;

  const { data: profile, error: profileError } = await supabase
    .from("admin_profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError || !profile || (profile.role !== "admin" && profile.role !== "staff")) {
    return null;
  }

  return { id: user.id, email: user.email ?? null, role: profile.role };
}
