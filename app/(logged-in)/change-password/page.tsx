"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChangePasswordSchema, changePasswordSchema } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { changePassword } from "@/actions/auth/changePassword";
import PasswordField from "@/components/PasswordField";

export default function Page() {
  const router = useRouter();
  const form = useForm<ChangePasswordSchema>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  async function onSubmit(data: ChangePasswordSchema) {
    form.clearErrors("root");
    const result = await changePassword(data);
    if (!result.success) {
      form.setError("root", { message: result.message });
    } else {
      toast.success("Password changed successfully");
      router.push("/my-account");
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
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
                name="currentPassword"
                render={({ field }) => (
                  <PasswordField
                    label="Current Password"
                    field={field}
                    autoComplete="current-password"
                  />
                )}
              />
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <PasswordField
                    label="New Password"
                    field={field}
                    autoComplete="new-password"
                  />
                )}
              />
              <FormField
                control={form.control}
                name="confirmNewPassword"
                render={({ field }) => (
                  <PasswordField
                    label="Confirm New Password"
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
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Changing password...
                  </>
                ) : (
                  "Change Password"
                )}
              </Button>
            </fieldset>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

//TODO: add password strength indicator
