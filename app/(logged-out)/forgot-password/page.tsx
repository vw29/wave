"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { forgotPasswordSchema, ForgotPasswordSchema } from "@/lib/schemas";
import { FieldDescription } from "@/components/ui/field";
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
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { forgotPassword } from "@/actions/auth/forgotPassword";
import { useSearchParams } from "next/navigation";
import { FormRootError } from "@/components/auth/form-root-error";
import { SubmitButton } from "@/components/auth/submit-button";
import { BackLink } from "@/components/auth/back-link";

export default function Page() {
  const searchParams = useSearchParams();
  const email = decodeURIComponent(searchParams.get("email") || "");
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email },
  });

  async function onSubmit(data: ForgotPasswordSchema) {
    const result = await forgotPassword(data);
    if (result?.success) {
      setSubmitted(true);
    } else {
      form.setError("root", { message: result?.message });
    }
  }

  if (submitted) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className="flex justify-center mb-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <MailCheck className="h-7 w-7 text-foreground" />
            </div>
          </div>
          <CardTitle className="text-center">Check your inbox</CardTitle>
          <CardDescription className="text-center">
            If an account with that email exists, we&apos;ve sent a password
            reset link. Check your spam folder if you don&apos;t see it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BackLink href="/login">Back to sign in</BackLink>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Forgot your password?</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send you a reset link.
        </CardDescription>
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
              <FormRootError message={form.formState.errors.root?.message} />
              <SubmitButton
                isSubmitting={form.formState.isSubmitting}
                label="Send reset link"
                loadingLabel="Sending..."
              />
              <BackLink href="/login">Back to sign in</BackLink>
              <FieldDescription className="text-center">
                Don&apos;t have an account?{" "}
                <Link href="/register">Sign up</Link>
              </FieldDescription>
            </fieldset>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
