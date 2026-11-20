import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { hmacSha256Hex, parseHmacSecret } from "@/lib/checkout/security";

export async function readJsonBody(request: NextRequest, maxBytes = 16_384): Promise<unknown | null> {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > maxBytes) return null;
  if (!request.body) return null;

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } catch {
    return null;
  }

  try {
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    return JSON.parse(new TextDecoder().decode(bytes)) as unknown;
  } catch {
    return null;
  }
}

export function isAllowedMutationOrigin(request: NextRequest): boolean {
  const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL;
  const requestOrigin = request.headers.get("origin");
  if (!configuredOrigin || !requestOrigin) return false;
  try {
    const incomingOrigin = new URL(requestOrigin).origin;
    const allowedOrigins = new Set([new URL(configuredOrigin).origin]);
    // Preview deployments have a unique, platform-assigned URL. Allow only this
    // exact origin in preview so preview mutations do not need the production URL.
    if (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL) {
      allowedOrigins.add(new URL("https://" + process.env.VERCEL_URL).origin);
    }
    return allowedOrigins.has(incomingOrigin);
  } catch {
    return false;
  }
}

export function jsonError(status: number, error: string) {
  return NextResponse.json({ error }, { status, headers: { "Cache-Control": "no-store" } });
}

/** Rate limiting fails closed if the DB or HMAC secret is unavailable. */
export async function consumeIdentifierRateLimit(
  scope: string,
  identifier: string,
  windowSeconds: number,
  maxRequests: number,
): Promise<"allowed" | "limited" | "unavailable"> {
  const client = createAdminSupabaseClient();
  const secret = parseHmacSecret(process.env.APP_HMAC_SECRET);
  if (!client || !secret || !identifier || identifier.length > 254) return "unavailable";

  const identifierHash = hmacSha256Hex(secret, `rate-limit:v1:${scope}:${identifier}`);
  const { data, error } = await client.rpc("consume_rate_limit", {
    p_scope: scope,
    p_identifier_hash: identifierHash,
    p_window_seconds: windowSeconds,
    p_max_requests: maxRequests,
  });
  if (error || typeof data !== "boolean") return "unavailable";
  return data ? "allowed" : "limited";
}

/** Uses only the reverse-proxy-provided x-real-ip header in production. */
export async function consumeRequestRateLimit(
  request: NextRequest,
  scope: string,
  windowSeconds: number,
  maxRequests: number,
): Promise<"allowed" | "limited" | "unavailable"> {
  const address = request.headers.get("x-real-ip")?.trim();
  const trustedAddress = address && address.length <= 64
    ? address
    : (process.env.NODE_ENV === "development" ? "local-development" : null);
  if (!trustedAddress) return "unavailable";
  return consumeIdentifierRateLimit(scope, trustedAddress, windowSeconds, maxRequests);
}
