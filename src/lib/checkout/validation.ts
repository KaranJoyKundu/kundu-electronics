import { isUuid, type CheckoutIdentityPayload } from "./security.ts";

export interface ParsedCheckoutBody {
  idempotencyKey: string;
  payload: CheckoutIdentityPayload;
}

function boundedText(value: unknown, min: number, max: number): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text.length >= min && text.length <= max ? text : null;
}

function optionalText(value: unknown, max: number): string | null | undefined {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") return undefined;
  const text = value.trim();
  return text.length <= max ? (text || null) : undefined;
}

export function parseCheckoutBody(value: unknown): ParsedCheckoutBody | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const body = value as Record<string, unknown>;
  if (!isUuid(body.idempotencyKey) || !isUuid(body.deliveryZoneId)) return null;
  if (!body.customer || typeof body.customer !== "object" || Array.isArray(body.customer)) return null;

  const customerInput = body.customer as Record<string, unknown>;
  const name = boundedText(customerInput.name, 1, 160);
  const phone = boundedText(customerInput.phone, 7, 32);
  const email = optionalText(customerInput.email, 254);
  const addressLine1 = boundedText(customerInput.addressLine1, 1, 220);
  const addressLine2 = optionalText(customerInput.addressLine2, 220);
  const area = optionalText(customerInput.area, 120);
  const city = boundedText(customerInput.city, 1, 120);
  const postalCode = optionalText(customerInput.postalCode, 24);
  const note = optionalText(customerInput.note, 1_400);

  if (!name || !phone || !addressLine1 || !city || email === undefined || addressLine2 === undefined || area === undefined || postalCode === undefined || note === undefined) return null;
  if (!/^[+0-9() .-]{7,32}$/.test(phone)) return null;
  if (email && (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) return null;

  if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 40) return null;
  const merged = new Map<string, { productId: string; variantId: string | null; quantity: number }>();
  for (const candidate of body.items) {
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return null;
    const item = candidate as Record<string, unknown>;
    if (!isUuid(item.productId) || (item.variantId !== undefined && item.variantId !== null && item.variantId !== "" && !isUuid(item.variantId))) return null;
    if (typeof item.quantity !== "number" || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) return null;
    const variantId = isUuid(item.variantId) ? item.variantId : null;
    const key = `${item.productId}:${variantId ?? ""}`;
    const current = merged.get(key);
    const quantity = (current?.quantity ?? 0) + (item.quantity as number);
    if (quantity > 99) return null;
    merged.set(key, { productId: item.productId, variantId, quantity });
  }

  return {
    idempotencyKey: body.idempotencyKey,
    payload: {
      customer: { name, phone, email, addressLine1, addressLine2, area, city, postalCode, note },
      items: [...merged.values()],
      deliveryZoneId: body.deliveryZoneId,
    },
  };
}

export function parsePaymentSubmissionBody(value: unknown): {
  idempotencyKey: string;
  method: "bkash" | "nagad";
  senderPhone: string;
  transactionReference: string;
} | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const body = value as Record<string, unknown>;
  if (!isUuid(body.idempotencyKey) || (body.method !== "bkash" && body.method !== "nagad")) return null;
  const senderPhone = boundedText(body.senderPhone, 7, 32);
  const transactionReference = boundedText(body.transactionReference, 4, 100);
  if (!senderPhone || !/^[+0-9() .-]{7,32}$/.test(senderPhone) || !transactionReference) return null;
  return { idempotencyKey: body.idempotencyKey, method: body.method, senderPhone, transactionReference };
}
