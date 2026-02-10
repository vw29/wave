import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(20, "Password must be at most 20 characters long")
  .refine((v) => /[A-Z]/.test(v), {
    message: "Password must contain an uppercase letter",
  })
  .refine((v) => /[a-z]/.test(v), {
    message: "Password must contain a lowercase letter",
  })
  .refine((v) => /[0-9]/.test(v), {
    message: "Password must contain a number",
  })
  .refine((v) => /[!@#$%^&*]/.test(v), {
    message: "Password must contain a special character",
  });

export const registerSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: passwordSchema,
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  });

export type RegisterSchema = z.infer<typeof registerSchema>;
