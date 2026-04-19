"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AuthCard, EmailField, PasswordField } from "@/components/auth";
import { loginSchema, LoginSchema } from "@/lib/schemas";
import { AUTH_TEXT, TOAST_MESSAGES, ERROR_MESSAGES } from "@/lib/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { loginUser } from "@/actions/auth/login";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn } from "lucide-react";
import { useState } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export default function Page() {
  const router = useRouter();
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      twoFactorCode: "",
    },
  });

  async function onSubmit(data: LoginSchema) {
    try {
      form.clearErrors("root");
      const result = await loginUser(data);
      if (result.requiresTwoFactor) {
        setRequiresTwoFactor(true);
        return;
      }
      if (!result.success) {
        form.setError("root", { message: result.message });
      } else {
        toast.success(TOAST_MESSAGES.loginSuccess);
        router.push("/");
      }
    } catch {
      toast.error(ERROR_MESSAGES.generic);
    }
  }

  const emailValue = form.watch("email");
  const resetHref = emailValue
    ? `/forgot-password?email=${encodeURIComponent(emailValue)}`
    : "/forgot-password";

  const footer = !requiresTwoFactor ? (
    <>
      <div className="text-muted-foreground text-sm text-center">
        {AUTH_TEXT.login.noAccount}{" "}
        <Link href="/register" className="underline hover:text-foreground">
          {AUTH_TEXT.common.register}
        </Link>
      </div>
      <div className="text-muted-foreground text-sm text-center">
        {AUTH_TEXT.login.forgotPassword}{" "}
        <Link href={resetHref} className="underline hover:text-foreground">
          {AUTH_TEXT.common.resetPassword}
        </Link>
      </div>
    </>
  ) : undefined;

  return (
    <main className="flex justify-center items-center min-h-screen p-4">
      <AuthCard
        icon={LogIn}
        title={
          requiresTwoFactor
            ? AUTH_TEXT.login.twoFactorTitle
            : AUTH_TEXT.login.title
        }
        description={
          requiresTwoFactor
            ? AUTH_TEXT.login.twoFactorDescription
            : AUTH_TEXT.login.description
        }
        footer={footer}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <fieldset
              disabled={form.formState.isSubmitting}
              className="flex flex-col gap-4"
            >
              {!requiresTwoFactor ? (
                <>
                  <EmailField control={form.control} name="email" />
                  <PasswordField control={form.control} name="password" />
                </>
              ) : (
                <FormField
                  control={form.control}
                  name="twoFactorCode"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-center gap-2">
                      <FormLabel>{AUTH_TEXT.login.twoFactorLabel}</FormLabel>
                      <FormControl>
                        <InputOTP
                          maxLength={6}
                          value={field.value}
                          onChange={field.onChange}
                          onComplete={() => form.handleSubmit(onSubmit)()}
                          autoFocus
                        >
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {form.formState.errors.root?.message && (
                <p className="text-sm text-destructive text-center">
                  {form.formState.errors.root.message}
                </p>
              )}
              <Button
                type="submit"
                className="w-full mt-2"
                disabled={
                  form.formState.isSubmitting ||
                  (requiresTwoFactor &&
                    form.watch("twoFactorCode")?.length !== 6)
                }
              >
                {form.formState.isSubmitting
                  ? requiresTwoFactor
                    ? AUTH_TEXT.login.verifying
                    : AUTH_TEXT.login.submitting
                  : requiresTwoFactor
                    ? AUTH_TEXT.login.verify
                    : AUTH_TEXT.login.submit}
              </Button>
            </fieldset>
          </form>
        </Form>
      </AuthCard>
    </main>
  );
}
