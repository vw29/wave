"use server";

import { auth } from "@/auth";
import { editProfileSchema, type EditProfileSchema } from "@/lib/schemas";
import { validateInput } from "@/lib/validation";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function updateFullProfile(data: EditProfileSchema) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, message: "You must be logged in." };
  }

  const validated = validateInput(editProfileSchema, data);
  if (!validated.success) return validated;

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        username: validated.data.username,
        name: validated.data.name?.trim() || null,
        bio: validated.data.bio?.trim() || null,
        profileImage: validated.data.profileImage?.trim() || null,
        website: validated.data.website?.trim() || null,
        school: validated.data.school?.trim() || null,
        city: validated.data.city?.trim() || null,
        workplace: validated.data.workplace?.trim() || null,
      },
    });

    revalidatePath("/my-account");
    revalidatePath("/");
    return { success: true as const };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { success: false as const, message: "This username is already taken." };
    }
    return { success: false as const, message: "Something went wrong." };
  }
}
