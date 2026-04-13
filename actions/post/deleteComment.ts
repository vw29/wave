"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteComment(commentId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in." };
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { authorId: true },
  });

  if (!comment) {
    return { error: "Comment not found." };
  }

  if (comment.authorId !== session.user.id) {
    return { error: "You can only delete your own comments." };
  }

  await prisma.comment.delete({ where: { id: commentId } });

  revalidatePath("/");
  return { success: true };
}
