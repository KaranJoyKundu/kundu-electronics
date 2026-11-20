import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { hashGuestOrderAccessToken, isUuid, parseHmacSecret } from "@/lib/checkout/security";
import { consumeRequestRateLimit, jsonError, readJsonBody } from "@/lib/security/request";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { parseReviewSubmission } from "@/lib/orders/review-validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ orderId: string }> };

function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin === request.nextUrl.origin;
  } catch {
    return false;
  }
}

function hashMatches(expected: string, actual: string): boolean {
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(actual, "hex");
  return a.length === b.length && a.length === 32 && timingSafeEqual(a, b);
}

async function authorizeOrder(request: NextRequest, orderId: string) {
  const token = request.cookies.get(`ke_order_${orderId}`)?.value;
  const secret = parseHmacSecret(process.env.APP_HMAC_SECRET);
  const admin = createAdminSupabaseClient();
  if (!token || !secret || !admin) return null;

  const tokenHash = hashGuestOrderAccessToken(secret, token);
  const { data: order, error } = await admin.from("orders")
    .select("order_access_token_hash,order_status,fulfilment_status,customer_user_id")
    .eq("id", orderId).maybeSingle();
  if (error || !order || !hashMatches(order.order_access_token_hash, tokenHash)) return null;
  return { admin, order, tokenHash };
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { orderId } = await context.params;
  if (!isUuid(orderId)) return jsonError(404, "Order not found.");
  const authorized = await authorizeOrder(request, orderId);
  if (!authorized) return jsonError(404, "Order not found.");

  const { data: review, error } = await authorized.admin.from("customer_reviews")
    .select("status").eq("order_id", orderId).maybeSingle();
  if (error) return jsonError(503, "Review status is temporarily unavailable.");

  const eligible = authorized.order.order_status === "confirmed"
    && authorized.order.fulfilment_status === "delivered";
  return NextResponse.json({
    eligible,
    alreadyReviewed: Boolean(review),
    reviewStatus: review?.status ?? null,
  }, { headers: { "Cache-Control": "no-store, private" } });
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { orderId } = await context.params;
  if (!isUuid(orderId)) return jsonError(404, "Order not found.");
  if (!isSameOrigin(request)) return jsonError(403, "Request origin is not allowed.");
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return jsonError(415, "Expected a JSON request.");
  }

  const submission = parseReviewSubmission(await readJsonBody(request, 8192));
  if (!submission) return jsonError(400, "Enter a valid 1–5 star rating and optional review text.");

  const limited = await consumeRequestRateLimit(request, "customer-review-submit", 600, 5);
  if (limited === "limited") return jsonError(429, "Too many review attempts. Please try again later.");
  if (limited === "unavailable") return jsonError(503, "Review submission is temporarily unavailable.");

  const authorized = await authorizeOrder(request, orderId);
  if (!authorized) return jsonError(404, "Order not found.");

  const { error } = await authorized.admin.rpc("submit_customer_review", {
    p_order_id: orderId,
    p_order_access_token_hash: authorized.tokenHash,
    p_rating: submission.rating,
    p_review_text: submission.reviewText,
    p_reviewer_display_name: submission.displayName,
  });
  if (error?.code === "23505") return jsonError(409, "A review has already been submitted for this order.");
  if (error?.code === "42501") return jsonError(403, "Only delivered orders can be reviewed.");
  if (error?.code === "22023") return jsonError(400, "Review details are invalid.");
  if (error) return jsonError(503, "Your review could not be submitted right now.");

  return NextResponse.json({ submitted: true, status: "pending" }, {
    status: 201, headers: { "Cache-Control": "no-store, private" },
  });
}
