"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { registerSchema, RegisterSchema } from "@/lib/schemas";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { registerUser } from "@/actions/auth/register";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { FieldDescription } from "@/components/ui/field";
import Link from "next/link";
import PasswordField from "@/components/PasswordField";
import { FormRootError } from "@/components/auth/form-root-error";
import { SubmitButton } from "@/components/auth/submit-button";

export default function Page() {
  const router = useRouter();
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
        toast.success("Account created successfully");
        router.push("/login");
      }
    } catch {
      toast.error("Something went wrong");
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>Enter your details to get started.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <fieldset
              className="flex flex-col gap-4"
              disabled={form.formState.isSubmitting}
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
                label="Create account"
                loadingLabel="Creating account..."
              />
              <FieldDescription className="text-center">
                Already have an account?{" "}
                <Link href="/login">Sign in</Link>
              </FieldDescription>
            </fieldset>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
