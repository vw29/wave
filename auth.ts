import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import argon2 from "argon2";
import { headers } from "next/headers";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(7, "60 s"),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const headerList = headers();
        const ip = (await headerList).get("x-forwarded-for") ?? "[IP_ADDRESS]";

        const { success } = await ratelimit.limit(
          `login:${ip}:${credentials?.email}`,
        );
        if (!success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials?.email as string,
          },
          select: {
            id: true,
            email: true,
            passwordHash: true,
          },
        });
        if (!user) {
          return null;
        }

        const isPasswordValid = await argon2.verify(
          user.passwordHash,
          credentials?.password as string,
        );
        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id.toString(),
          email: user.email,
        };
      },
    }),
  ],
});
