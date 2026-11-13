import type { CartLine } from "./types.ts";

const STORAGE_KEY = "kundu-electronics-cart-v1";
const EMPTY_CART: readonly CartLine[] = Object.freeze([]);
const UNREAD = Symbol("unread-cart-storage");

type SnapshotCache = string | null | typeof UNREAD;
type CartStorage = Pick<Storage, "getItem" | "setItem">;

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isCartLine(value: unknown): value is CartLine {
  if (!value || typeof value !== "object") return false;
  const line = value as Record<string, unknown>;
  return typeof line.productId === "string" && uuidPattern.test(line.productId)
    && (line.variantId === null || (typeof line.variantId === "string" && uuidPattern.test(line.variantId)))
    && typeof line.quantity === "number" && Number.isInteger(line.quantity) && line.quantity >= 1 && line.quantity <= 99;
}

/** Parse untrusted browser storage into the small public cart representation. */
export function parseStoredCart(raw: string | null): CartLine[] {
  if (raw === null) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isCartLine) : [];
  } catch {
    return [];
  }
}

/**
 * Small external store keeps browser persistence outside React effects. The
 * injectable storage accessor also makes blocked-storage behaviour testable.
 */
export function createCartStore(getStorage: () => CartStorage | null) {
  let cachedStorageValue: SnapshotCache = UNREAD;
  let cachedLines: readonly CartLine[] = EMPTY_CART;
  let storageUnavailable = false;
  const listeners = new Set<() => void>();

  function notifySubscribers(): void {
    for (const listener of listeners) listener();
  }

  function readSnapshot(): readonly CartLine[] {
    if (storageUnavailable) return cachedLines;

    try {
      const storage = getStorage();
      if (!storage) {
        storageUnavailable = true;
        return cachedLines;
      }
      const raw = storage.getItem(STORAGE_KEY);
      if (raw !== cachedStorageValue) {
        cachedStorageValue = raw;
        cachedLines = parseStoredCart(raw);
      }
    } catch {
      // Preserve the current tab's memory snapshot when browser storage is blocked.
      storageUnavailable = true;
    }

    return cachedLines;
  }

  function subscribe(listener: () => void): () => void {
    listeners.add(listener);

    function handleStorage(event: StorageEvent): void {
      if (event.key !== null && event.key !== STORAGE_KEY) return;
      storageUnavailable = false;
      cachedStorageValue = UNREAD;
      readSnapshot();
      notifySubscribers();
    }

    if (typeof window !== "undefined") window.addEventListener("storage", handleStorage);

    return () => {
      listeners.delete(listener);
      if (typeof window !== "undefined") window.removeEventListener("storage", handleStorage);
    };
  }

  function update(updater: (current: readonly CartLine[]) => CartLine[]): void {
    const next = updater(readSnapshot());
    cachedLines = next;
    const serialized = JSON.stringify(next);
    cachedStorageValue = serialized;

    try {
      const storage = getStorage();
      if (!storage) {
        storageUnavailable = true;
      } else {
        storage.setItem(STORAGE_KEY, serialized);
        storageUnavailable = false;
      }
    } catch {
      storageUnavailable = true;
    }

    notifySubscribers();
  }

  return { getSnapshot: readSnapshot, subscribe, update };
}

const browserCartStore = createCartStore(() => {
  if (typeof window === "undefined") return null;
  return window.localStorage;
});

export function getCartSnapshot(): readonly CartLine[] {
  return typeof window === "undefined" ? EMPTY_CART : browserCartStore.getSnapshot();
}

export function getServerCartSnapshot(): readonly CartLine[] {
  return EMPTY_CART;
}

export function subscribeToCart(listener: () => void): () => void {
  return browserCartStore.subscribe(listener);
}

export function updateCart(updater: (current: readonly CartLine[]) => CartLine[]): void {
  if (typeof window === "undefined") return;
  browserCartStore.update(updater);
}

export function getHydratedSnapshot(): boolean {
  return typeof window !== "undefined";
}

export function getServerHydratedSnapshot(): boolean {
  return false;
}

export function subscribeToHydration(): () => void {
  // Hydration is a one-way environment transition; useSyncExternalStore compares
  // the server snapshot with the client snapshot after hydration automatically.
  return () => undefined;
}
