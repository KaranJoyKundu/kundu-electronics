import { NextResponse, type NextRequest } from "next/server";
import { hashGuestOrderAccessToken, isUuid, parseHmacSecret } from "@/lib/checkout/security";
import { parsePaymentSubmissionBody } from "@/lib/checkout/validation";
import { consumeRequestRateLimit, isAllowedMutationOrigin, jsonError, readJsonBody } from "@/lib/security/request";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ orderId: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  if (!isAllowedMutationOrigin(request)) return jsonError(403, "Request origin is not allowed.");
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return jsonError(415, "Expected a JSON request.");

  const { orderId } = await context.params;
  if (!isUuid(orderId)) return jsonError(404, "Order not found.");
  const token = request.cookies.get(`ke_order_${orderId}`)?.value;
  const secret = parseHmacSecret(process.env.APP_HMAC_SECRET);
  const admin = createAdminSupabaseClient();
  if (!token || !secret || !admin) return jsonError(404, "Order not found.");

  const limited = await consumeRequestRateLimit(request, "payment-submit", 600, 6);
  if (limited === "limited") return jsonError(429, "Too many payment submissions. Please try again later.");
  if (limited === "unavailable") return jsonError(503, "Payment submission is temporarily unavailable.");

  const payment = parsePaymentSubmissionBody(await readJsonBody(request, 8_192));
  if (!payment) return jsonError(400, "Payment submission details are incomplete or invalid.");
  const tokenHash = hashGuestOrderAccessToken(secret, token);

  const { data: order, error: orderError } = await admin.rpc("get_guest_order_summary", {
    p_order_id: orderId,
    p_order_access_token_hash: tokenHash,
  });
  if (orderError || !order || typeof order !== "object") return jsonError(404, "Order not found.");

  const summary = order as { orderStatus?: string; totalBdt?: number; paymentStatus?: string; paymentPreference?: string | null };
  if (summary.paymentPreference === "cash_on_delivery") return jsonError(409, "Cash on delivery orders cannot submit an online transfer.");
  if (summary.orderStatus !== "awaiting_payment" || !Number.isSafeInteger(summary.totalBdt) || (summary.totalBdt ?? 0) <= 0) {
    return jsonError(409, "This order is not ready to receive payment information.");
  }

  const { data: submissionId, error } = await admin.rpc("submit_manual_payment", {
    p_order_id: orderId,
    p_order_access_token_hash: tokenHash,
    p_idempotency_key: payment.idempotencyKey,
    p_method: payment.method,
    p_sender_phone: payment.senderPhone,
    p_transaction_reference: payment.transactionReference,
    p_amount_bdt: summary.totalBdt,
  });

  if (error || !isUuid(submissionId)) {
    return jsonError(422, "The payment reference could not be recorded. Check the order status and reference, then try again.");
  }

  return NextResponse.json({
    paymentSubmissionId: submissionId,
    paymentStatus: "pending_verification",
    message: "Your payment details were submitted. Payment remains pending until the store verifies the transaction.",
  }, { headers: { "Cache-Control": "no-store" } });
}
