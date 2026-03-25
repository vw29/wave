import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { validateResetToken } from "@/actions/auth/validateResetToken";
import { ResetPasswordForm } from "./reset-password-form";
import { BackLink } from "@/components/auth/back-link";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  const isValid = token ? (await validateResetToken(token)).valid : false;

  if (!isValid) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Invalid reset link</CardTitle>
          <CardDescription>
            This link is invalid or has expired. Please request a new one.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BackLink href="/forgot-password">Request a new link</BackLink>
        </CardContent>
      </Card>
    );
  }

  return <ResetPasswordForm token={token!} />;
}
