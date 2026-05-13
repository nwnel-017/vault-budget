import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const uploadRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "5 s"),
  analytics: true,
  prefix: "flowvault-rate-limit",
});
