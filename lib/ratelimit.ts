import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(7, "60 s"),
});

export async function checkRateLimit(identifier: string | null,type:"login"|"register"|"changePassword"|"forgetPassword"|"resetPassword") {
  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0] ||
    headerList.get("x-real-ip") ||
    "127.0.0.1";

  try {
    const { success } = await ratelimit.limit(`${type}:${ip}:${identifier}`);
    if (!success) {
      throw new Error("RATE_LIMITED");
    }
  } catch (error) {
    // If it's a rate limit error, re-throw it
    if (error instanceof Error && error.message === "RATE_LIMITED") {
      throw error;
    }
    // Otherwise it's a Redis connection issue — log it and allow the request through
    console.error("[ratelimit] Redis unavailable, skipping rate limit check:", error);
  }
}
