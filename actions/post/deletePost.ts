"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deletePost(postId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to delete a post." };
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });

  if (!post) {
    return { error: "Post not found." };
  }

  if (post.authorId !== session.user.id) {
    return { error: "You can only delete your own posts." };
  }

  await prisma.post.delete({ where: { id: postId } });

  revalidatePath("/");
  revalidatePath(`/post/${postId}`);
  return { success: true };
}
