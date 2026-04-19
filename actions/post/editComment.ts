"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function editComment(commentId: string, text: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to edit a comment." };
  }

  const trimmed = text.trim();
  if (!trimmed) {
    return { error: "Comment cannot be empty." };
  }
  if (trimmed.length > 300) {
    return { error: "Comment must be 300 characters or less." };
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { authorId: true, postId: true },
  });

  if (!comment) {
    return { error: "Comment not found." };
  }

  if (comment.authorId !== session.user.id) {
    return { error: "You can only edit your own comments." };
  }

  await prisma.comment.update({
    where: { id: commentId },
    data: { text: trimmed },
  });

  revalidatePath("/");
  revalidatePath(`/post/${comment.postId}`);
  return { success: true };
}
