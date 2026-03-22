"use client";

import PasswordField from "@/components/PasswordField";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

export default function Page({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const form = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      passwordConfirmation: "",
    },
  });

  if (!token) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
              <CardHeader>
                <CardTitle>Invalid Token</CardTitle>
                <CardDescription>
                  The token provided is invalid or has expired. Please request a
                  new one.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  onClick={() => router.push("/forget-password")}
                >
                  Back to Forget Password
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }
  async function onSubmit(data: ResetPasswordSchema) {
    try {
      form.clearErrors("root");
      const result = await resetPassword(data, token!);
      if (!result.success) {
        form.setError("root", { message: result.message });
      } else {
        toast.success("Your password has been updated successfully");
        router.push("/login");
      }
    } catch {
      toast.error("Something went wrong");
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className={cn("flex flex-col gap-6", className)} {...props}>
          <Card>
            <CardHeader>
              <CardTitle>Set a new password</CardTitle>
              <CardDescription>
                Create a new password. Ensure it differs from your previous
                passwords.
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
                      name="password"
                      render={({ field }) => (
                        <PasswordField
                          label="Password"
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
                    {form.formState.errors.root && (
                      <p className="text-destructive text-sm text-center">
                        {form.formState.errors.root.message}
                      </p>
                    )}
                    <Button
                      type="submit"
                      disabled={form.formState.isSubmitting}
                    >
                      {form.formState.isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Resetting password...
                        </>
                      ) : (
                        "Reset Password"
                      )}
                    </Button>
                  </fieldset>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
