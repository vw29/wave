"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function unblockUser(targetUserId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in." };
  }

  await prisma.block.deleteMany({
    where: {
      blockerId: session.user.id,
      blockedId: targetUserId,
    },
  });

  revalidatePath("/");
  return { success: true };
}
