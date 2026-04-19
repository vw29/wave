"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function unfollowUser(targetUserId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in." };
  }

  await prisma.follow.deleteMany({
    where: {
      followerId: session.user.id,
      followingId: targetUserId,
    },
  });

  const [currentUser, targetUser] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id }, select: { username: true } }),
    prisma.user.findUnique({ where: { id: targetUserId }, select: { username: true } }),
  ]);

  revalidatePath("/");
  if (currentUser) revalidatePath(`/profile/${currentUser.username}`);
  if (targetUser) revalidatePath(`/profile/${targetUser.username}`);
  return { success: true };
}
