type RateLimitEntry = { count: number; resetAt: number };

const store = new Map<string, RateLimitEntry>();

// Purge expired entries every 10 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) store.delete(key);
  }
}, 10 * 60 * 1000);

/**
 * Returns true if request is within the rate limit, false if exceeded.
 * @param key      Unique identifier (e.g. `"contact:1.2.3.4"`)
 * @param limit    Max requests allowed per window
 * @param windowMs Time window in milliseconds
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}
