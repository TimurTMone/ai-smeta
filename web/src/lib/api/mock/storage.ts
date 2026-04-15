/**
 * Tiny persistence layer for mock API.
 *
 * Writes to localStorage so that the demo feels real across refreshes.
 * Reads from fixtures on first access, then from localStorage on subsequent.
 *
 * All keys are namespaced under `aismeta:mock:*` to avoid collisions.
 */

const PREFIX = "aismeta:mock:";

const isBrowser = typeof window !== "undefined";

export function loadCollection<T>(key: string, fallback: T[]): T[] {
  if (!isBrowser) return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (!raw) {
      window.localStorage.setItem(PREFIX + key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw) as T[];
  } catch {
    return fallback;
  }
}

export function saveCollection<T>(key: string, value: T[]): void {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Quota or privacy mode — silently fail
  }
}

export function loadObject<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveObject<T>(key: string, value: T): void {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export function clearAll(): void {
  if (!isBrowser) return;
  const keys: string[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i);
    if (k && k.startsWith(PREFIX)) keys.push(k);
  }
  keys.forEach((k) => window.localStorage.removeItem(k));
}

export function uuid(): string {
  if (isBrowser && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return "id_" + Math.random().toString(36).slice(2, 10);
}

export function delay(ms: number = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
