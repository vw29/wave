"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  AuthCard,
  SuccessCard,
  EmailField,
  PasswordField,
  ConfirmPasswordField,
} from "@/components/auth";
import { registerSchema, RegisterSchema } from "@/lib/schemas";
import { AUTH_TEXT, TOAST_MESSAGES, ERROR_MESSAGES } from "@/lib/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { registerUser } from "@/actions/auth/register";
import toast from "react-hot-toast";
import Link from "next/link";
import { UserPlus } from "lucide-react";

export default function Page() {
  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  async function onSubmit(data: RegisterSchema) {
    try {
      form.clearErrors("root");
      const result = await registerUser(data);
      if (!result?.success) {
        form.setError("root", { message: result?.message });
      } else {
        toast.success(TOAST_MESSAGES.registerSuccess);
      }
    } catch {
      toast.error(ERROR_MESSAGES.generic);
    }
  }

  if (form.formState.isSubmitSuccessful) {
    return (
      <main className="flex justify-center items-center min-h-screen p-4">
        <AuthCard
          icon={UserPlus}
          title={AUTH_TEXT.register.successTitle}
          description={AUTH_TEXT.register.successDescription}
        >
          <SuccessCard
            title={AUTH_TEXT.register.successTitle}
            description={AUTH_TEXT.register.successDescription}
            linkHref="/login"
            linkText={AUTH_TEXT.common.continueToLogin}
          />
        </AuthCard>
      </main>
    );
  }

  const footer = (
    <div className="text-muted-foreground text-sm text-center">
      {AUTH_TEXT.register.hasAccount}{" "}
      <Link href="/login" className="underline hover:text-foreground">
        {AUTH_TEXT.common.signIn}
      </Link>
    </div>
  );

  return (
    <main className="flex justify-center items-center min-h-screen p-4">
      <AuthCard
        icon={UserPlus}
        title={AUTH_TEXT.register.title}
        description={AUTH_TEXT.register.description}
        footer={footer}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <fieldset
              disabled={form.formState.isSubmitting}
              className="flex flex-col gap-4"
            >
              <EmailField control={form.control} name="email" />
              <PasswordField
                control={form.control}
                name="password"
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
                  ? AUTH_TEXT.register.submitting
                  : AUTH_TEXT.register.submit}
              </Button>
            </fieldset>
          </form>
        </Form>
      </AuthCard>
    </main>
  );
}
