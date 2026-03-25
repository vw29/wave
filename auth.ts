import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import argon2 from "argon2";
import { checkRateLimit } from "@/lib/ratelimit";

async function authorizeUser(
  credentials: Partial<Record<"email" | "password", unknown>>,
) {
  const email = credentials.email as string | undefined;
  const password = credentials.password as string | undefined;

  if (!email || !password) return null;

  await checkRateLimit(email, "login");

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, passwordHash: true },
  });

  if (!user) return null;

  const isPasswordValid = await argon2.verify(user.passwordHash, password);
  if (!isPasswordValid) return null;

  return { id: user.id, email: user.email };
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: authorizeUser,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
