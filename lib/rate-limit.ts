type RateLimitResult = { success: boolean; remaining?: number };

const store = new Map<string, { count: number; reset: number }>();

export async function rateLimit(
  ip: string,
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const now = Date.now();
  const id = `${ip}:${key}`;
  const entry = store.get(id) ?? { count: 0, reset: now + windowMs };

  if (now > entry.reset) {
    entry.count = 0;
    entry.reset = now + windowMs;
  }

  entry.count++;
  store.set(id, entry);

  return { success: entry.count <= limit, remaining: limit - entry.count };
}
