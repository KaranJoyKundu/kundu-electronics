"use server";

import { headers } from "next/headers";
import { consumeIdentifierRateLimit } from "@/lib/security/request";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface AdminLoginState {
  message: string;
  submitted: boolean;
}

export const initialAdminLoginState: AdminLoginState = {
  message: "",
  submitted: false,
};

export async function requestAdminSignIn(
  _previousState: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  const rawEmail = formData.get("email");
  const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";

  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { message: "Enter a valid email address.", submitted: false };
  }

  const requestHeaders = await headers();
  const address = requestHeaders.get("x-real-ip")?.trim()
    ?? (process.env.NODE_ENV === "development" ? "local-development" : "");
  const [emailLimit, addressLimit] = await Promise.all([
    consumeIdentifierRateLimit("admin-login-email", email, 900, 5),
    consumeIdentifierRateLimit("admin-login-ip", address, 900, 20),
  ]);
  if (emailLimit === "limited" || addressLimit === "limited") {
    return { message: "Too many sign-in attempts. Please try again later.", submitted: false };
  }
  if (emailLimit === "unavailable" || addressLimit === "unavailable") {
    return { message: "Admin sign-in is temporarily unavailable.", submitted: false };
  }

  const supabase = await createServerSupabaseClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!supabase || !siteUrl) {
    return { message: "Admin sign-in is not configured yet. Add the Supabase public environment values first.", submitted: false };
  }

  const redirectTo = new URL("/auth/callback?next=%2Fadmin", siteUrl).toString();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false, emailRedirectTo: redirectTo },
  });

  if (error) {
    return { message: "A sign-in link could not be sent. Check the Supabase Auth email configuration and try again.", submitted: false };
  }

  return {
    message: "If this email belongs to an already-provisioned admin or staff account, a sign-in link has been sent.",
    submitted: true,
  };
}
