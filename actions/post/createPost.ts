"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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

  await prisma.post.create({
    data: {
      content: trimmed,
      image: image || null,
      authorId: session.user.id,
    },
  });

  revalidatePath("/");
  return { success: true };
}
