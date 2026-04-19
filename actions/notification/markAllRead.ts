"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function markAllRead() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  await prisma.notification.updateMany({
    where: { receiverId: session.user.id, read: false },
    data: { read: true },
  });

  revalidatePath("/");
  return { success: true };
}
