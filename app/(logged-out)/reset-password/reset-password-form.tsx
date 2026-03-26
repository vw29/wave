"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { AuthCard, PasswordField, ConfirmPasswordField } from "@/components/auth";
import { resetPasswordSchema, ResetPasswordSchema } from "@/lib/schemas";
import { AUTH_TEXT, TOAST_MESSAGES, ERROR_MESSAGES, FORM_TEXT } from "@/lib/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { resetPassword } from "@/actions/auth/resetPassword";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const form = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      passwordConfirmation: "",
    },
  });

  async function onSubmit(data: ResetPasswordSchema) {
    try {
      form.clearErrors("root");
      const result = await resetPassword(data, token);
      if (!result.success) {
        form.setError("root", { message: result.message });
      } else {
        toast.success(TOAST_MESSAGES.passwordUpdated);
        router.push("/login");
      }
    } catch {
      toast.error(ERROR_MESSAGES.generic);
    }
  }

  return (
    <main className="flex justify-center items-center min-h-screen p-4">
      <AuthCard
        icon={KeyRound}
        title={AUTH_TEXT.updatePassword.title}
        description={AUTH_TEXT.updatePassword.description}
        backHref="/login"
        backLabel={AUTH_TEXT.common.backToLogin}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <fieldset
              disabled={form.formState.isSubmitting}
              className="flex flex-col gap-4"
            >
              <PasswordField
                control={form.control}
                name="password"
                label={FORM_TEXT.newPassword.label}
                placeholder={FORM_TEXT.newPassword.placeholder}
                autoComplete="new-password"
              />
              <ConfirmPasswordField
                control={form.control}
                name="passwordConfirmation"
              />
              {form.formState.errors.root?.message && (
                <p className="text-sm text-destructive text-center">
                  {form.formState.errors.root.message}
                </p>
              )}
              <Button
                type="submit"
                className="w-full mt-2"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting
                  ? AUTH_TEXT.updatePassword.submitting
                  : AUTH_TEXT.updatePassword.submit}
              </Button>
            </fieldset>
          </form>
        </Form>
      </AuthCard>
    </main>
  );
}
