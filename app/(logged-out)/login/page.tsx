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

export default function Page() {
  const router = useRouter();
  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginSchema) {
    try {
      form.clearErrors("root");
      const result = await loginUser(data);
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
        <CardDescription>Sign in to your account to continue.</CardDescription>
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
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <PasswordField
                    label="Password"
                    field={field}
                    autoComplete="current-password"
                    href={`/forget-password?email=${encodeURIComponent(form.watch("email"))}`}
                  />
                )}
              />
              <FormRootError message={form.formState.errors.root?.message} />
              <div className="flex flex-col gap-2">
                <SubmitButton
                  isSubmitting={form.formState.isSubmitting}
                  label="Sign in"
                  loadingLabel="Signing in..."
                />
                <Button variant="outline" type="button">
                  Sign in with Google
                </Button>
              </div>
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
