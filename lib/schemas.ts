import { z } from "zod";

export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username must be at most 20 characters")
  .regex(
    /^[a-zA-Z0-9_]+$/,
    "Username can only contain letters, numbers, and underscores",
  )
  .trim()
  .toLowerCase();

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(30, "Password must be at most 30 characters long")
  .refine((v) => /[A-Z]/.test(v), {
    message: "Password must contain an uppercase letter",
  })
  .refine((v) => /[a-z]/.test(v), {
    message: "Password must contain a lowercase letter",
  })
  .refine((v) => /[0-9]/.test(v), {
    message: "Password must contain a number",
  })
  .refine((v) => /[^A-Za-z0-9]/.test(v), {
    message: "Password must contain a special character",
  });

export const registerSchema = z
  .object({
    email: z.string().email("Invalid email address").trim().toLowerCase(),
    username: usernameSchema,
    password: passwordSchema,
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  });

export const profileSchema = z.object({
  name: z.string().max(50, "Name must be at most 50 characters").optional(),
  bio: z.string().max(160, "Bio must be at most 160 characters").optional(),
  profileImage: z.string().optional(),
  website: z
    .string()
    .refine((v) => v === "" || /^https?:\/\/.+/.test(v), {
      message: "Must be a valid URL",
    })
    .optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address").trim().toLowerCase(),
  password: z.string().min(1, "Password is required"),
  twoFactorCode: z.string().optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmNewPassword: z.string().min(1, "Confirm new password is required"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address").trim().toLowerCase(),
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    passwordConfirmation: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  });

export type RegisterSchema = z.infer<typeof registerSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
export type ProfileSchema = z.infer<typeof profileSchema>;
