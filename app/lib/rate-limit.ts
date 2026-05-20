import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// In-memory fallback cache for local development
const inMemoryCache = new Map<string, { count: number; expiresAt: number }>();

export async function rateLimit(
  ip: string,
  keyPrefix: string,
  maxAttempts: number = 5,
  windowMs: number = 10 * 60 * 1000 // 10 minutes
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  // If Upstash Redis environment variables are available, use Upstash Redis
  if (
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN &&
    process.env.UPSTASH_REDIS_REST_URL !== ""
  ) {
    try {
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });

      const ratelimit = new Ratelimit({
        redis: redis,
        limiter: Ratelimit.slidingWindow(maxAttempts, `${windowMs / 1000} s`),
        analytics: true,
        prefix: `securegate:${keyPrefix}`,
      });

      const result = await ratelimit.limit(ip);
      return {
        success: result.success,
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
      };
    } catch (err) {
      console.error(
        "Upstash Redis rate-limiter failed. Falling back to in-memory rate limiting.",
        err
      );
    }
  }

  // In-memory fallback logic
  const key = `${keyPrefix}:${ip}`;
  const now = Date.now();
  const cached = inMemoryCache.get(key);

  if (!cached || now > cached.expiresAt) {
    // Initialize or reset window
    const expiresAt = now + windowMs;
    inMemoryCache.set(key, { count: 1, expiresAt });
    return {
      success: true,
      limit: maxAttempts,
      remaining: maxAttempts - 1,
      reset: expiresAt,
    };
  }

  if (cached.count >= maxAttempts) {
    return {
      success: false,
      limit: maxAttempts,
      remaining: 0,
      reset: cached.expiresAt,
    };
  }

  cached.count += 1;
  return {
    success: true,
    limit: maxAttempts,
    remaining: maxAttempts - cached.count,
    reset: cached.expiresAt,
  };
}
