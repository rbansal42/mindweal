type RateLimitRecord = {
    count: number;
    resetTime: number;
};

const rateLimitStore = new Map<string, RateLimitRecord>();

interface RateLimitOptions {
    windowMs?: number;
    maxRequests?: number;
}

const defaults: Required<RateLimitOptions> = {
    windowMs: 60 * 1000,
    maxRequests: 10,
};

/**
 * Check if a request should be rate limited.
 * Returns { limited: false } if allowed, { limited: true, retryAfter } if blocked.
 */
export function checkRateLimit(
    key: string,
    options: RateLimitOptions = {}
): { limited: boolean; retryAfter?: number; remaining?: number } {
    const { windowMs, maxRequests } = { ...defaults, ...options };
    const now = Date.now();

    const record = rateLimitStore.get(key);

    if (!record || now > record.resetTime) {
        rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
        return { limited: false, remaining: maxRequests - 1 };
    }

    if (record.count >= maxRequests) {
        const retryAfter = Math.ceil((record.resetTime - now) / 1000);
        return { limited: true, retryAfter };
    }

    record.count++;
    return { limited: false, remaining: maxRequests - record.count };
}

/**
 * Get rate limit key from request (uses IP or forwarded IP).
 */
export function getRateLimitKey(request: Request, prefix: string): string {
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || "unknown";
    return `${prefix}:${ip}`;
}

// Cleanup old entries periodically (every 5 minutes)
if (typeof setInterval !== "undefined") {
    setInterval(() => {
        const now = Date.now();
        for (const [key, record] of rateLimitStore.entries()) {
            if (now > record.resetTime) {
                rateLimitStore.delete(key);
            }
        }
    }, 5 * 60 * 1000);
}
