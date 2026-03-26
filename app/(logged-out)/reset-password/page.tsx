import { Button } from "@/components/ui/button";
import { AuthCard } from "@/components/auth";
import { validateResetToken } from "@/actions/auth/validateResetToken";
import { ResetPasswordForm } from "./reset-password-form";
import { AUTH_TEXT } from "@/lib/constants";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  const isValid = token ? (await validateResetToken(token)).valid : false;

  if (!isValid) {
    return (
      <main className="flex justify-center items-center min-h-screen p-4">
        <AuthCard
          icon={ShieldAlert}
          title={AUTH_TEXT.updatePassword.invalidTitle}
          description={AUTH_TEXT.updatePassword.invalidDescription}
        >
          <Button asChild className="w-full">
            <Link href="/forgot-password">
              {AUTH_TEXT.updatePassword.requestNew}
            </Link>
          </Button>
        </AuthCard>
      </main>
    );
  }

  return <ResetPasswordForm token={token!} />;
}
