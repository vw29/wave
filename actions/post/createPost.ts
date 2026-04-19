"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { processMentions } from "@/lib/mentions";

export async function createPost(content: string, image?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to create a post." };
  }

  const trimmed = content.trim();
  if (!trimmed) {
    return { error: "Post content cannot be empty." };
  }
  if (trimmed.length > 500) {
    return { error: "Post content must be 500 characters or less." };
  }

  const [post, user] = await Promise.all([
    prisma.post.create({
      data: {
        content: trimmed,
        image: image || null,
        authorId: session.user.id,
      },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { username: true },
    }),
  ]);

  await processMentions(trimmed, session.user.id, post.id);

  revalidatePath("/");
  if (user) revalidatePath(`/profile/${user.username}`);
  return { success: true };
}
