type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

type RateLimitState = {
  count: number;
  resetAt: number;
};

const globalStore = globalThis as typeof globalThis & {
  __campusLinkRateLimitStore?: Map<string, RateLimitState>;
};

const store = globalStore.__campusLinkRateLimitStore || new Map<string, RateLimitState>();
globalStore.__campusLinkRateLimitStore = store;

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") || "unknown";
}

export function getRateLimitKey(request: Request, scope: string, userId?: string | null) {
  return `${scope}:${userId || getClientIp(request)}`;
}

export function checkRateLimit({ key, limit, windowMs }: RateLimitOptions) {
  const now = Date.now();
  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    const next: RateLimitState = {
      count: 1,
      resetAt: now + windowMs,
    };
    store.set(key, next);
    return {
      allowed: true,
      remaining: Math.max(0, limit - next.count),
      resetAt: next.resetAt,
    };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: current.resetAt,
    };
  }

  current.count += 1;
  store.set(key, current);

  return {
    allowed: true,
    remaining: Math.max(0, limit - current.count),
    resetAt: current.resetAt,
  };
}

export function createRateLimitResponse(message: string, resetAt: number) {
  return new Response(
    JSON.stringify({
      ok: false,
      error: message,
      retryAfterMs: Math.max(0, resetAt - Date.now()),
    }),
    { status: 429 }
  );
}
