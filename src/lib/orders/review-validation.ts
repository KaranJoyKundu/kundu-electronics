export interface ReviewSubmission {
  rating: number;
  reviewText: string | null;
  displayName: string | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseReviewSubmission(value: unknown): ReviewSubmission | null {
  if (!isRecord(value) || typeof value.rating !== "number"
    || !Number.isInteger(value.rating) || value.rating < 1 || value.rating > 5) return null;

  if (!(value.reviewText === undefined || value.reviewText === null || typeof value.reviewText === "string")
    || !(value.displayName === undefined || value.displayName === null || typeof value.displayName === "string")) return null;

  const reviewText = typeof value.reviewText === "string" ? value.reviewText.trim() : "";
  const displayName = typeof value.displayName === "string" ? value.displayName.trim() : "";
  if (reviewText.length > 1000 || displayName.length > 80) return null;

  return { rating: value.rating, reviewText: reviewText || null, displayName: displayName || null };
}
