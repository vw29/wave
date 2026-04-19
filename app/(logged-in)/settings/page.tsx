import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import SettingsPage from "@/components/settings/SettingsPage";

export default async function Page() {
  const session = await auth();

  const twoFactorAuth = await prisma.twoFactor.findUnique({
    where: { userId: session?.user?.id },
    select: { twoFactorActivated: true },
  });

  const isTwoFactorActivated = twoFactorAuth?.twoFactorActivated ?? false;

  return (
    <SettingsPage
      email={session?.user?.email ?? ""}
      isTwoFactorActivated={isTwoFactorActivated}
    />
  );
}
