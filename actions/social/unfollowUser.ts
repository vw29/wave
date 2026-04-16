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

  revalidatePath("/");
  return { success: true };
}
