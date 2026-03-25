"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form, FormField } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChangePasswordSchema, changePasswordSchema } from "@/lib/schemas";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { changePassword } from "@/actions/auth/changePassword";
import PasswordField from "@/components/PasswordField";
import { FormRootError } from "@/components/auth/form-root-error";
import { SubmitButton } from "@/components/auth/submit-button";

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
        <CardDescription>
          Update your password to keep your account secure.
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
              <FormRootError message={form.formState.errors.root?.message} />
              <SubmitButton
                isSubmitting={form.formState.isSubmitting}
                label="Change Password"
                loadingLabel="Changing password..."
              />
            </fieldset>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
