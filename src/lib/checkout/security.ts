import { createHmac, timingSafeEqual } from "node:crypto";

export interface CheckoutIdentityPayload {
  customer: {
    name: string;
    phone: string;
    email: string | null;
    addressLine1: string;
    addressLine2: string | null;
    area: string | null;
    city: string;
    postalCode: string | null;
    note: string | null;
  };
  items: Array<{ productId: string; variantId: string | null; quantity: number }>;
  deliveryZoneId: string;
  paymentPreference: "cash_on_delivery" | "online_payment";
}

export function parseHmacSecret(secret: string | undefined): Buffer | null {
  if (!secret || !/^[a-f0-9]{64}$/i.test(secret)) return null;
  return Buffer.from(secret, "hex");
}

export function hmacSha256Hex(secret: Buffer, value: string): string {
  return createHmac("sha256", secret).update(value, "utf8").digest("hex");
}

/** Stable canonical payload; callers must validate and normalize fields before this function. */
export function canonicalizeCheckoutPayload(payload: CheckoutIdentityPayload): string {
  return JSON.stringify({
    customer: {
      name: payload.customer.name,
      phone: payload.customer.phone,
      email: payload.customer.email,
      addressLine1: payload.customer.addressLine1,
      addressLine2: payload.customer.addressLine2,
      area: payload.customer.area,
      city: payload.customer.city,
      postalCode: payload.customer.postalCode,
      note: payload.customer.note,
    },
    items: [...payload.items]
      .sort((a, b) => a.productId.localeCompare(b.productId) || (a.variantId ?? "").localeCompare(b.variantId ?? ""))
      .map((item) => ({ productId: item.productId, variantId: item.variantId, quantity: item.quantity })),
    deliveryZoneId: payload.deliveryZoneId,
    // Preserve legacy online-payment fingerprints; COD is the only new fingerprint field.
    ...(payload.paymentPreference === "cash_on_delivery" ? { paymentPreference: "cash_on_delivery" } : {}),
  });
}

export function createCheckoutCredentials(
  secret: Buffer,
  idempotencyKey: string,
  payload: CheckoutIdentityPayload,
): { fingerprint: string; accessToken: string; accessTokenHash: string } {
  const fingerprint = hmacSha256Hex(secret, `checkout-request:v1:${idempotencyKey}:${canonicalizeCheckoutPayload(payload)}`);
  const accessToken = hmacSha256Hex(secret, `guest-order-access:v1:${idempotencyKey}:${fingerprint}`);
  const accessTokenHash = hmacSha256Hex(secret, `guest-order-access-hash:v1:${accessToken}`);
  return { fingerprint, accessToken, accessTokenHash };
}

export function hashGuestOrderAccessToken(secret: Buffer, token: string): string {
  return hmacSha256Hex(secret, `guest-order-access-hash:v1:${token}`);
}

export function safeTokenEquals(left: string, right: string): boolean {
  if (!/^[a-f0-9]{64}$/i.test(left) || !/^[a-f0-9]{64}$/i.test(right)) return false;
  return timingSafeEqual(Buffer.from(left, "hex"), Buffer.from(right, "hex"));
}

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
