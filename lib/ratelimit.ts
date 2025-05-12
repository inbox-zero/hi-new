import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Check if Upstash Redis environment variables are set
const upstashEnabled =
  !!process.env.UPSTASH_REDIS_REST_URL &&
  !!process.env.UPSTASH_REDIS_REST_TOKEN;

let redis: Redis | null = null;
let ipRateLimiter: Ratelimit | null = null;

if (upstashEnabled) {
  // Create a new Redis client instance only if enabled
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  // Create a new ratelimiter only if enabled
  ipRateLimiter = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(10, "10 s"), // 10 requests per 10 seconds
  });
} else {
  console.warn(
    "Upstash Redis environment variables not set. Rate limiting is disabled."
  );
}

/**
 * Applies rate limiting based on IP address if Upstash is configured.
 * @param identifier The identifier (usually IP address) to limit.
 * @returns A promise resolving to the rate limit result (success or failure).
 */
export async function limitByIp(identifier: string) {
  if (!ipRateLimiter) {
    // If rate limiter is not configured, always allow the request.
    // Mimic the success response structure of Ratelimit.limit()
    return {
      success: true,
      limit: 0, // Indicate no limit was applied/available
      remaining: 0, // Indicate no limit was applied/available
      reset: Date.now(), // Indicate no limit was applied/available
    };
  }
  return ipRateLimiter.limit(identifier);
}
