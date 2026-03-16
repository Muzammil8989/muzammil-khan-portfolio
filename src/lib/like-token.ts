/**
 * Like-token utilities
 *
 * Each browser gets a persistent UUID ("like token") stored in localStorage
 * AND synced to a cookie so the server can read it during SSR.
 *
 * This replaces IP-based deduplication:
 *   - Same network, different devices  → different UUIDs  → all can like ✓
 *   - Same browser, multiple tabs      → same UUID         → can't double-like ✓
 *   - Private / incognito window       → new UUID           → can like again (acceptable) ✓
 */

const TOKEN_KEY = "like_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUUID(value: string): boolean {
  return UUID_RE.test(value);
}

/**
 * Returns the persistent like-token for this browser.
 * Creates one on first call and syncs it to a cookie for SSR reads.
 * Safe to call in SSR — returns "anonymous" on server or storage failure.
 */
export function getOrCreateLikeToken(): string {
  if (typeof window === "undefined") return "anonymous";
  try {
    let token = localStorage.getItem(TOKEN_KEY);
    if (!token || !isValidUUID(token)) {
      token = crypto.randomUUID();
      localStorage.setItem(TOKEN_KEY, token);
    }
    // Keep cookie in sync so [slug]/page.tsx can read it server-side
    document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
    return token;
  } catch {
    return "anonymous";
  }
}

// ---------------------------------------------------------------------------
// Safe localStorage wrappers (crash-proof in Safari Private Mode)
// ---------------------------------------------------------------------------

export function safeGet(key: string, fallback = "[]"): string {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

export function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Silently swallow — Safari private mode throws QuotaExceededError
  }
}
