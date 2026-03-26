"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { loginSchema, LoginSchema } from "@/lib/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { loginUser } from "@/actions/auth/login";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PasswordField from "@/components/PasswordField";
import { FormRootError } from "@/components/auth/form-root-error";
import { SubmitButton } from "@/components/auth/submit-button";
import { useState } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { AuthCard } from "@/components/auth/AuthCard";
import { LogIn } from "lucide-react";
import { AUTH_TEXT } from "@/lib/constants";

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
        toast.success("Signed in successfully");
        router.push("/my-account");
      }
    } catch {
      toast.error("Something went wrong");
    }
  }

  const emailValue = form.watch("email");
  const resetHref = emailValue
    ? `/password-reset?email=${encodeURIComponent(emailValue)}`
    : "/password-reset";

  const footer = (
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
          Reset Password
        </Link>
      </div>
    </>
  );

  return (
    <main className="flex justify-center items-center min-h-screen p-4">
      <AuthCard
        icon={LogIn}
        title={"Hello "}
        description={"hEllo AgAIN "}
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
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="john.doe@example.com"
                            autoComplete="email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <PasswordField
                        label="Password"
                        field={field}
                        autoComplete="current-password"
                        href={`/forgot-password?email=${encodeURIComponent(form.watch("email"))}`}
                      />
                    )}
                  />
                </>
              ) : (
                <FormField
                  control={form.control}
                  name="twoFactorCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Authenticator Code</FormLabel>
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
              <FormRootError message={form.formState.errors.root?.message} />
              <div className="flex flex-col gap-2">
                <SubmitButton
                  isSubmitting={form.formState.isSubmitting}
                  disabled={
                    requiresTwoFactor &&
                    form.watch("twoFactorCode")?.length !== 6
                  }
                  label={requiresTwoFactor ? "Verify" : "Sign in"}
                  loadingLabel={
                    requiresTwoFactor ? "Verifying..." : "Signing in..."
                  }
                />
              </div>
              {!requiresTwoFactor && (
                <FieldDescription className="text-center">
                  Don&apos;t have an account?{" "}
                  <Link href="/register">Sign up</Link>
                </FieldDescription>
              )}
            </fieldset>
          </form>
        </Form>
      </AuthCard>
    </main>
  );
}
