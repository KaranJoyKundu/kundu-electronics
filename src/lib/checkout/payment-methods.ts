export type PaymentMethod = "bkash" | "nagad";

export interface ConfiguredPaymentMethod {
  method: PaymentMethod;
  receivingNumber: string;
  instructions: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPaymentMethod(value: unknown): value is PaymentMethod {
  return value === "bkash" || value === "nagad";
}

/**
 * Parse the public RPC response without trusting its runtime shape. Unsupported
 * methods are omitted so an unexpected database value can never reach checkout UI.
 */
export function parsePublicPaymentMethods(value: unknown): ConfiguredPaymentMethod[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry): ConfiguredPaymentMethod[] => {
    if (!isRecord(entry)) return [];

    const row = entry;
    if (!isPaymentMethod(row.method)) return [];
    if (typeof row.receivingNumber !== "string" || row.receivingNumber.trim().length === 0) return [];
    if (typeof row.instructions !== "string" || row.instructions.trim().length === 0) return [];

    return [{
      method: row.method,
      receivingNumber: row.receivingNumber,
      instructions: row.instructions,
    }];
  });
}
