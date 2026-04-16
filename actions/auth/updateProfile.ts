"use server";

import { profileSchema, type ProfileSchema } from "@/lib/schemas";
import { validateInput } from "@/lib/validation";
import prisma from "@/lib/prisma";

export async function updateProfile(email: string, data: ProfileSchema) {
  const validated = validateInput(profileSchema, data);
  if (!validated.success) return validated;

  try {
    await prisma.user.update({
      where: { email },
      data: {
        name: validated.data.name?.trim() || null,
        bio: validated.data.bio?.trim() || null,
        profileImage: validated.data.profileImage?.trim() || null,
        website: validated.data.website?.trim() || null,
        school: validated.data.school?.trim() || null,
        city: validated.data.city?.trim() || null,
        workplace: validated.data.workplace?.trim() || null,
      },
    });

    return { success: true as const };
  } catch {
    return { success: false as const, message: "Something went wrong" };
  }
}
