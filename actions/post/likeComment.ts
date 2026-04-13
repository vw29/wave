"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function likeComment(commentId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to like a comment." };
  }

  const existing = await prisma.commentLike.findUnique({
    where: {
      userId_commentId: {
        userId: session.user.id,
        commentId,
      },
    },
  });

  if (existing) {
    await prisma.commentLike.delete({
      where: {
        userId_commentId: {
          userId: session.user.id,
          commentId,
        },
      },
    });
  } else {
    await prisma.commentLike.create({
      data: {
        userId: session.user.id,
        commentId,
      },
    });
  }

  revalidatePath("/");
  return { success: true };
}
