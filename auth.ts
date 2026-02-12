import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import argon2 from "argon2";
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


basic