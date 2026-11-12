import { NextResponse, type NextRequest } from "next/server";
import { createCheckoutCredentials, parseHmacSecret, isUuid } from "@/lib/checkout/security";
import { parseCheckoutBody } from "@/lib/checkout/validation";
import { consumeRequestRateLimit, isAllowedMutationOrigin, jsonError, readJsonBody } from "@/lib/security/request";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isAllowedMutationOrigin(request)) return jsonError(403, "Request origin is not allowed.");
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return jsonError(415, "Expected a JSON request.");

  const limited = await consumeRequestRateLimit(request, "checkout-create", 600, 10);
  if (limited === "limited") return jsonError(429, "Too many checkout attempts. Please try again later.");
  if (limited === "unavailable") return jsonError(503, "Checkout is temporarily unavailable.");

  const parsed = parseCheckoutBody(await readJsonBody(request));
  if (!parsed) return jsonError(400, "Checkout details are incomplete or invalid.");
  const secret = parseHmacSecret(process.env.APP_HMAC_SECRET);
  const admin = createAdminSupabaseClient();
  if (!secret || !admin) return jsonError(503, "Checkout has not been configured yet.");

  const credentials = createCheckoutCredentials(secret, parsed.idempotencyKey, parsed.payload);
  let customerUserId: string | null = null;
  const userClient = await createServerSupabaseClient();
  if (userClient) {
    const { data } = await userClient.auth.getUser();
    if (data.user && isUuid(data.user.id)) customerUserId = data.user.id;
  }

  const { data, error } = await admin.rpc("create_checkout_order", {
    p_idempotency_key: parsed.idempotencyKey,
    p_request_fingerprint: credentials.fingerprint,
    p_order_access_token_hash: credentials.accessTokenHash,
    p_customer_details: parsed.payload.customer,
    p_items: parsed.payload.items,
    p_delivery_zone_id: parsed.payload.deliveryZoneId,
    p_customer_user_id: customerUserId,
  });

  if (error || !Array.isArray(data) || !data[0]) {
    // Do not echo database errors: they may contain identifiers or implementation details.
    return jsonError(422, "The order could not be placed. Check product availability and delivery details, then try again.");
  }

  const order = data[0] as {
    order_id: string; order_number: string; order_status: string; stock_status: string;
    subtotal_bdt: number; delivery_charge_bdt: number; total_bdt: number;
  };
  if (!isUuid(order.order_id)) return jsonError(500, "The order could not be confirmed.");

  const response = NextResponse.json({
    orderId: order.order_id,
    orderNumber: order.order_number,
    orderStatus: order.order_status,
    stockStatus: order.stock_status,
    subtotalBdt: order.subtotal_bdt,
    deliveryChargeBdt: order.delivery_charge_bdt,
    totalBdt: order.total_bdt,
  }, { status: 201, headers: { "Cache-Control": "no-store" } });

  response.cookies.set(`ke_order_${order.order_id}`, credentials.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: `/api/orders/${order.order_id}`,
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
