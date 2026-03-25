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

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>
          {requiresTwoFactor
            ? "Enter the code from your authenticator app."
            : "Sign in to your account to continue."}
        </CardDescription>
      </CardHeader>
      <CardContent>
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
                  disabled={requiresTwoFactor && form.watch("twoFactorCode")?.length !== 6}
                  label={requiresTwoFactor ? "Verify" : "Sign in"}
                  loadingLabel={
                    requiresTwoFactor ? "Verifying..." : "Signing in..."
                  }
                />
                {!requiresTwoFactor && (
                  <Button variant="outline" type="button">
                    Sign in with Google
                  </Button>
                )}
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
      </CardContent>
    </Card>
  );
}
