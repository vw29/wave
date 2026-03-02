"use server";

import { forgetPasswordSchema, ForgetPasswordSchema } from "@/lib/schemas";

export async function forgetPassword(data: ForgetPasswordSchema) {
  const result = forgetPasswordSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      message: "Invalid data",
    };
  }

  const { email } = result.data;

  const user = await prisma?.user.findUnique({
    where: { email },
  });

  if (!user) {
    return {
      success: false,
      message: "User not found",
    };
  }

  // TODO: Generate a token with crypto & sha256
  // TODO: Store hashedToken in DB, set expiresAt to 15 minutes from now (email plainToken to user)
  // TODO: Send an email to the user with the token (use resend)
}
