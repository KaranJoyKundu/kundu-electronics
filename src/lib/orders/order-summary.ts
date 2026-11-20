export interface OrderSummary {
  orderId: string;
  orderNumber: string;
  customerName: string;
  deliveryZone: string;
  deliveryCity: string;
  orderStatus: string;
  stockStatus: string;
  paymentStatus: string;
  paymentPreference: "cash_on_delivery" | "online_payment" | null;
  fulfilmentStatus: string;
  subtotalBdt: number;
  deliveryChargeBdt: number;
  totalBdt: number;
  createdAt: string;
  items: Array<{
    sku: string | null;
    name: string;
    variant: string | null;
    unitPriceBdt: number;
    quantity: number;
    lineTotalBdt: number;
  }>;
  payment: {
    method: "bkash" | "nagad";
    status: string;
    submittedAt: string;
    rejectionReason?: string | null;
  } | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isMoney(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

/** Parse the public order-status API response before it enters UI state. */
export function parseOrderSummary(payload: unknown): OrderSummary | null {
  if (!isRecord(payload) || !isRecord(payload.order)) return null;
  const row = payload.order;

  if (
    !isNonEmptyString(row.orderId)
    || !isNonEmptyString(row.orderNumber)
    || !isNonEmptyString(row.customerName)
    || !isNonEmptyString(row.deliveryZone)
    || !isNonEmptyString(row.deliveryCity)
    || !isNonEmptyString(row.orderStatus)
    || !isNonEmptyString(row.stockStatus)
    || !isNonEmptyString(row.paymentStatus)
    || !(row.paymentPreference === undefined || row.paymentPreference === null || row.paymentPreference === "cash_on_delivery" || row.paymentPreference === "online_payment")
    || !isNonEmptyString(row.fulfilmentStatus)
    || !isMoney(row.subtotalBdt)
    || !isMoney(row.deliveryChargeBdt)
    || !isMoney(row.totalBdt)
    || !isNonEmptyString(row.createdAt)
    || !Array.isArray(row.items)
  ) return null;

  const rawItems: unknown[] = row.items;
  const items = rawItems.flatMap((item): OrderSummary["items"] => {
    if (!isRecord(item)) return [];
    if (
      !(item.sku === null || typeof item.sku === "string")
      || !isNonEmptyString(item.name)
      || !(item.variant === null || typeof item.variant === "string")
      || !isMoney(item.unitPriceBdt)
      || typeof item.quantity !== "number"
      || !Number.isSafeInteger(item.quantity)
      || item.quantity < 1
      || !isMoney(item.lineTotalBdt)
    ) return [];
    return [{
      sku: item.sku,
      name: item.name,
      variant: item.variant,
      unitPriceBdt: item.unitPriceBdt,
      quantity: item.quantity,
      lineTotalBdt: item.lineTotalBdt,
    }];
  });
  if (items.length !== rawItems.length) return null;

  let payment: OrderSummary["payment"] = null;
  if (row.payment !== null) {
    if (!isRecord(row.payment)) return null;
    const paymentMethod = row.payment.method;
    if (
      (paymentMethod !== "bkash" && paymentMethod !== "nagad")
      || !isNonEmptyString(row.payment.status)
      || !isNonEmptyString(row.payment.submittedAt)
      || !(row.payment.rejectionReason === undefined || row.payment.rejectionReason === null || typeof row.payment.rejectionReason === "string")
    ) return null;
    payment = {
      method: paymentMethod,
      status: row.payment.status,
      submittedAt: row.payment.submittedAt,
      rejectionReason: row.payment.rejectionReason,
    };
  }

  return {
    orderId: row.orderId,
    orderNumber: row.orderNumber,
    customerName: row.customerName,
    deliveryZone: row.deliveryZone,
    deliveryCity: row.deliveryCity,
    orderStatus: row.orderStatus,
    stockStatus: row.stockStatus,
    paymentStatus: row.paymentStatus,
    paymentPreference: row.paymentPreference === undefined ? null : row.paymentPreference,
    fulfilmentStatus: row.fulfilmentStatus,
    subtotalBdt: row.subtotalBdt,
    deliveryChargeBdt: row.deliveryChargeBdt,
    totalBdt: row.totalBdt,
    createdAt: row.createdAt,
    items,
    payment,
  };
}
