import { auth } from "@/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import prisma from "@/lib/prisma";
import EditProfileForm from "./edit-profile-form";
import TwoFactorAuthenticationForm from "./two-factor-authentication";

export default async function Page() {
  const session = await auth();

  const [user, twoFactorAuth] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session?.user?.id },
      select: {
        username: true,
        name: true,
        bio: true,
        profileImage: true,
        website: true,
        school: true,
        city: true,
        workplace: true,
      },
    }),
    prisma.twoFactor.findUnique({
      where: { userId: session?.user?.id },
      select: { twoFactorActivated: true },
    }),
  ]);

  if (!user) return null;

  const isTwoFactorActivated = twoFactorAuth?.twoFactorActivated ?? false;

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Manage your profile information
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <EditProfileForm user={user} />

        <Separator />

        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm font-medium">Email</p>
            <p className="text-sm text-muted-foreground">
              {session?.user?.email}
            </p>
          </div>
          <TwoFactorAuthenticationForm
            isTwoFactorActivated={isTwoFactorActivated}
          />
        </div>
      </CardContent>
    </Card>
  );
}
