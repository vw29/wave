"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { loginSchema, LoginSchema } from "@/lib/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { loginUser } from "@/actions/login.actions";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Page({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginSchema) {
    const result = await loginUser(data);
    if (!result.success) {
      form.setError("email", { message: result.message });
    }

    if (result.success) {
      toast.success("Login successful");
      setTimeout(() => {
        router.push("/");
      }, 1500);
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className={cn("flex flex-col gap-6", className)} {...props}>
          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>Enter your email below to login</CardDescription>
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
                          <FieldLabel htmlFor="email">Email</FieldLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              placeholder="jhon.doe@example.com"
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
                        <FormItem>
                          <FieldLabel htmlFor="password">Password</FieldLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="password"
                              placeholder="********"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormItem>
                      <Button type="submit">Login</Button>
                      <Button variant="outline" type="button">
                        Login with Google
                      </Button>
                      <FieldDescription className="text-center">
                        Don&apos;t have an account?{" "}
                        <Link href="/register">Sign up</Link>
                      </FieldDescription>
                    </FormItem>
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
