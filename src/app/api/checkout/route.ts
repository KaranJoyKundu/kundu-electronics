import { after, NextResponse, type NextRequest } from "next/server";
import { createCheckoutCredentials, parseHmacSecret, isUuid } from "@/lib/checkout/security";
import { parseCheckoutBody } from "@/lib/checkout/validation";
import { consumeRequestRateLimit, isAllowedMutationOrigin, jsonError, readJsonBody } from "@/lib/security/request";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatTelegramOrderMessage, sendTelegramMessage } from "@/lib/orders/telegram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function notifyTelegramOrder(admin: NonNullable<ReturnType<typeof createAdminSupabaseClient>>, orderId: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
  if (!token || !chatId) return;

  // A unique order ledger entry makes checkout retries idempotent for notifications.
  const { data: inserted, error: ledgerError } = await admin
    .from("order_telegram_notifications")
    .insert({ order_id: orderId, status: "sending" })
    .select("id")
    .maybeSingle();

  let notificationId = inserted?.id as string | undefined;
  if (!notificationId && ledgerError) {
    // Permit retry after a prior failed delivery, but only one concurrent retry can claim it.
    const { data: retryClaim } = await admin
      .from("order_telegram_notifications")
      .update({ status: "sending", failure_code: null, updated_at: new Date().toISOString() })
      .eq("order_id", orderId)
      .eq("status", "failed")
      .select("id")
      .maybeSingle();
    notificationId = retryClaim?.id as string | undefined;
  }
  if (!notificationId) {
    // Ledger missing (migration not applied) or already sending/sent. Do not risk duplicate alerts.
    if (ledgerError && ledgerError.code !== "23505") console.warn("Telegram order notification ledger unavailable.");
    return;
  }

  const [orderResult, itemsResult] = await Promise.all([
    admin.from("orders").select("order_number,customer_name,customer_phone,delivery_address_line_1,delivery_area,delivery_city,delivery_zone_name_snapshot,subtotal_bdt,delivery_charge_bdt,total_bdt,order_status,stock_status,payment_status,created_at").eq("id", orderId).maybeSingle(),
    admin.from("order_items").select("sku_snapshot,product_name_snapshot,variant_name_snapshot,quantity,line_total_bdt").eq("order_id", orderId),
  ]);
  if (orderResult.error || !orderResult.data || itemsResult.error) {
    await admin.from("order_telegram_notifications").update({
      status: "failed", failure_code: "order-read-failed", updated_at: new Date().toISOString(),
    }).eq("id", notificationId);
    console.warn("Telegram order notification skipped: order snapshot unavailable.");
    return;
  }

  const order = orderResult.data;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  let adminUrl = "";
  try { adminUrl = new URL("/admin/orders", siteUrl).toString(); } catch { /* site origin is misconfigured */ }
  const message = formatTelegramOrderMessage({
    orderNumber: order.order_number,
    customerName: order.customer_name,
    customerPhone: order.customer_phone,
    addressLine: order.delivery_address_line_1,
    area: order.delivery_area,
    city: order.delivery_city,
    deliveryZone: order.delivery_zone_name_snapshot,
    orderStatus: order.order_status,
    stockStatus: order.stock_status,
    paymentStatus: order.payment_status,
    subtotalBdt: Number(order.subtotal_bdt),
    deliveryBdt: Number(order.delivery_charge_bdt),
    totalBdt: Number(order.total_bdt),
    createdAt: new Date(order.created_at).toLocaleString("en-BD", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Dhaka" }),
    items: (itemsResult.data ?? []).map((item) => ({
      name: item.product_name_snapshot,
      variant: item.variant_name_snapshot,
      sku: item.sku_snapshot,
      quantity: Number(item.quantity),
      lineTotalBdt: Number(item.line_total_bdt),
    })),
    adminUrl,
  });
  const result = await sendTelegramMessage(token, chatId, message);
  await admin.from("order_telegram_notifications").update({
    status: result.ok ? "sent" : "failed",
    sent_at: result.ok ? new Date().toISOString() : null,
    failure_code: result.failureCode ?? null,
    updated_at: new Date().toISOString(),
  }).eq("id", notificationId);
  if (!result.ok) console.warn("Telegram order notification delivery failed:", result.failureCode);
}

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

  // Next's after() runs after the response, so Telegram latency/failure never blocks checkout.
  after(() => notifyTelegramOrder(admin, order.order_id));

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
