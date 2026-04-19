import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

type RateLimitAction =
  | "login"
  | "register"
  | "changePassword"
  | "forgotPassword"
  | "resetPassword"
  | "verifyEmail"
  | "verifyEmailCode";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(7, "60 s"),
});

export async function checkRateLimit(
  identifier: string | null,
  type: RateLimitAction,
) {
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
    if (error instanceof Error && error.message === "RATE_LIMITED") {
      throw error;
    }
    console.error(
      "[ratelimit] Redis unavailable, skipping rate limit check:",
      error,
    );
  }
}

export async function enforceRateLimit(
  identifier: string | null,
  type: RateLimitAction,
): Promise<{ success: false; message: string } | null> {
  try {
    await checkRateLimit(identifier, type);
    return null;
  } catch (error) {
    if (error instanceof Error && error.message === "RATE_LIMITED") {
      return {
        success: false,
        message: "Too many requests. Please try again later.",
      };
    }
    throw error;
  }
}
