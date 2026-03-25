import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import TwoFactorAuthenticationForm from "./two-factor-authentication";

export default async function Page() {
  const session = await auth();

  const twoFactorAuth = await prisma.twoFactor.findUnique({
    where: { userId: session?.user?.id },
    select: { twoFactorActivated: true },
  });

  const isTwoFactorActivated = twoFactorAuth?.twoFactorActivated ?? false;

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>My Account</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div>
          <p className="text-sm font-medium">Email</p>
          <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
        </div>
        <TwoFactorAuthenticationForm
          isTwoFactorActivated={isTwoFactorActivated}
        />
      </CardContent>
    </Card>
  );
}
