"use client";

import PasswordField from "@/components/PasswordField";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form, FormField } from "@/components/ui/form";
import { resetPassword } from "@/actions/auth/resetPassword";
import { resetPasswordSchema, ResetPasswordSchema } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Link from "next/link";
import { FormRootError } from "@/components/auth/form-root-error";
import { SubmitButton } from "@/components/auth/submit-button";

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
        toast.success("Password updated successfully");
        router.push("/login");
      }
    } catch {
      toast.error("Something went wrong");
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Set a new password</CardTitle>
        <CardDescription>Enter your new password below.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <fieldset
              disabled={form.formState.isSubmitting}
              className="flex flex-col gap-4"
            >
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <PasswordField
                    label="New Password"
                    field={field}
                    autoComplete="new-password"
                  />
                )}
              />
              <FormField
                control={form.control}
                name="passwordConfirmation"
                render={({ field }) => (
                  <PasswordField
                    label="Confirm Password"
                    field={field}
                    autoComplete="new-password"
                  />
                )}
              />
              <FormRootError message={form.formState.errors.root?.message} />
              <SubmitButton
                isSubmitting={form.formState.isSubmitting}
                label="Reset password"
                loadingLabel="Resetting..."
              />
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to sign in
              </Link>
            </fieldset>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
