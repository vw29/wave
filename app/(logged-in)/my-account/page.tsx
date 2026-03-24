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
    <Card className="w-87.5">
      <CardHeader>
        <CardTitle>My Account</CardTitle>
      </CardHeader>
      <CardContent>
        <label>Email</label>
        <div className="text-muted-foreground">{session?.user?.email}</div>
        <TwoFactorAuthenticationForm
          isTwoFactorActivated={isTwoFactorActivated}
        />
      </CardContent>
    </Card>
  );
}
