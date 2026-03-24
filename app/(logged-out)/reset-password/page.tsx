import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { validateResetToken } from "@/actions/auth/validateResetToken";
import { ResetPasswordForm } from "./reset-password-form";

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
          <Link
            href="/forget-password"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Request a new link
          </Link>
        </CardContent>
      </Card>
    );
  }

  return <ResetPasswordForm token={token!} />;
}
