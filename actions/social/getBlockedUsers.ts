"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function getBlockedUsers() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const blocks = await prisma.block.findMany({
    where: { blockerId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      blocked: {
        select: {
          id: true,
          username: true,
          name: true,
          profileImage: true,
        },
      },
    },
  });

  return blocks.map((b: { blocked: { id: string; username: string; name: string | null; profileImage: string | null } }) => b.blocked);
}

export type BlockedUser = Awaited<ReturnType<typeof getBlockedUsers>>[number];
