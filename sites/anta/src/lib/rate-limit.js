// Copied from the repo-root site (src/lib/rate-limit.js @ f6ebe99) so the two apps never share code.
// Per-isolate memory only: a second layer behind the Workers Rate Limiting binding.
const buckets = new Map();

export function checkRateLimit(key, limit = 8, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (current.count >= limit) {
    return false;
  }

  current.count += 1;
  return true;
}
