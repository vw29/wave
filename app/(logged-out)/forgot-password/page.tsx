"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { AuthCard, EmailField } from "@/components/auth";
import { forgotPasswordSchema, ForgotPasswordSchema } from "@/lib/schemas";
import { AUTH_TEXT } from "@/lib/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { forgotPassword } from "@/actions/auth/forgotPassword";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { KeyRound, Mail } from "lucide-react";

export default function Page() {
  const searchParams = useSearchParams();
  const email = decodeURIComponent(searchParams.get("email") || "");

  const form = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email },
  });

  async function onSubmit(data: ForgotPasswordSchema) {
    form.clearErrors("root");
    const result = await forgotPassword(data);
    if (!result?.success) {
      form.setError("root", { message: result?.message });
    }
  }

  if (form.formState.isSubmitSuccessful) {
    return (
      <main className="flex justify-center items-center min-h-screen p-4">
        <AuthCard
          icon={Mail}
          title={AUTH_TEXT.passwordReset.successTitle}
          description={AUTH_TEXT.passwordReset.successDescription}
        >
          <Button asChild className="w-full">
            <Link href="/login">{AUTH_TEXT.common.backToLogin}</Link>
          </Button>
        </AuthCard>
      </main>
    );
  }

  const footer = (
    <>
      <div className="text-muted-foreground text-sm text-center">
        {AUTH_TEXT.login.noAccount}{" "}
        <Link href="/register" className="underline hover:text-foreground">
          {AUTH_TEXT.common.register}
        </Link>
      </div>
      <div className="text-muted-foreground text-sm text-center">
        {AUTH_TEXT.passwordReset.rememberPassword}{" "}
        <Link href="/login" className="underline hover:text-foreground">
          {AUTH_TEXT.common.signIn}
        </Link>
      </div>
    </>
  );

  return (
    <main className="flex justify-center items-center min-h-screen p-4">
      <AuthCard
        icon={KeyRound}
        title={AUTH_TEXT.passwordReset.title}
        description={AUTH_TEXT.passwordReset.description}
        footer={footer}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <fieldset
              disabled={form.formState.isSubmitting}
              className="flex flex-col gap-4"
            >
              <EmailField control={form.control} name="email" />
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
                  ? AUTH_TEXT.passwordReset.submitting
                  : AUTH_TEXT.passwordReset.submit}
              </Button>
            </fieldset>
          </form>
        </Form>
      </AuthCard>
    </main>
  );
}
