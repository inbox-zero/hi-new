import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error("Upstash Redis environment variables are not set correctly.");
}

// Create a new Redis client instance if you don't have one already.
// This client is stateless and can be reused.
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Create a new ratelimiter, that allows 10 requests per 10 seconds for a given identifier.
export const ipRateLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"), // 10 requests per 10 seconds
  analytics: true, // Enable analytics (optional, incurs a small cost)
  /**
   * Optional prefix for the keys used in Redis.
   * This is useful if you want to share a Redis instance with other applications.
   */
  prefix: "@upstash/ratelimit_hinew", // Example prefix
});

// You can create more specific ratelimiters here if needed, e.g., for API keys, user IDs, etc. 