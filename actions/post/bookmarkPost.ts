"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function bookmarkPost(postId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to save a post." };
  }

  const existing = await prisma.bookmark.findUnique({
    where: {
      userId_postId: {
        userId: session.user.id,
        postId,
      },
    },
  });

  if (existing) {
    await prisma.bookmark.delete({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
    });
  } else {
    await prisma.bookmark.create({
      data: {
        userId: session.user.id,
        postId,
      },
    });
  }

  revalidatePath("/");
  revalidatePath(`/post/${postId}`);
  return { success: true };
}
