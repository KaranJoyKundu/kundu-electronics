import { NextResponse, type NextRequest } from "next/server";
import { hashGuestOrderAccessToken, isUuid, parseHmacSecret } from "@/lib/checkout/security";
import { jsonError } from "@/lib/security/request";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ orderId: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { orderId } = await context.params;
  if (!isUuid(orderId)) return jsonError(404, "Order not found.");

  const token = request.cookies.get(`ke_order_${orderId}`)?.value;
  const secret = parseHmacSecret(process.env.APP_HMAC_SECRET);
  const admin = createAdminSupabaseClient();
  if (!token || !secret || !admin) return jsonError(404, "Order not found.");

  const tokenHash = hashGuestOrderAccessToken(secret, token);
  const { data, error } = await admin.rpc("get_guest_order_summary", {
    p_order_id: orderId,
    p_order_access_token_hash: tokenHash,
  });
  if (error || !data || typeof data !== "object") return jsonError(404, "Order not found.");

  return NextResponse.json({ order: data }, { headers: { "Cache-Control": "no-store, private" } });
}
