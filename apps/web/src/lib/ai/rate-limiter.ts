interface RateLimiterConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitEntry {
  timestamps: number[];
}

const defaultConfig: RateLimiterConfig = {
  maxRequests: 5,
  windowMs: 60000,
};

const rateLimitStore = new Map<string, RateLimitEntry>();

export function checkRateLimit(
  identifier: string = "default",
  config: RateLimiterConfig = defaultConfig
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier) || { timestamps: [] };

  const validTimestamps = entry.timestamps.filter(
    (t) => now - t < config.windowMs
  );

  const remaining = Math.max(0, config.maxRequests - validTimestamps.length);
  const allowed = validTimestamps.length < config.maxRequests;

  let resetIn = 0;
  if (validTimestamps.length > 0) {
    const oldestTimestamp = Math.min(...validTimestamps);
    resetIn = Math.ceil((oldestTimestamp + config.windowMs - now) / 1000);
  }

  if (allowed) {
    validTimestamps.push(now);
    rateLimitStore.set(identifier, { timestamps: validTimestamps });
  } else {
    rateLimitStore.set(identifier, { timestamps: validTimestamps });
  }

  return { allowed, remaining, resetIn };
}

export function cleanupOldEntries(maxAgeMs: number = 300000): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    const validTimestamps = entry.timestamps.filter(
      (t) => now - t < maxAgeMs
    );
    if (validTimestamps.length === 0) {
      rateLimitStore.delete(key);
    } else {
      rateLimitStore.set(key, { timestamps: validTimestamps });
    }
  }
}

setInterval(cleanupOldEntries, 60000);

export const aiRateLimiter = {
  config: { maxRequests: 5, windowMs: 60000 },
  
  check(identifier: string) {
    return checkRateLimit(identifier, this.config);
  },
};
