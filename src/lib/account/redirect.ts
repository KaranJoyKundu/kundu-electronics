const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function safeAccountNextPath(value: string | null | undefined): string {
 if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\") || /[\r\n]/.test(value)) return "/account";
 return value;
}
export function guestOrderIdFromNextPath(value: string): string | null {
 const match = value.match(/^\/orders\/([0-9a-f-]{36})$/i);
 return match && uuidPattern.test(match[1]) ? match[1] : null;
}