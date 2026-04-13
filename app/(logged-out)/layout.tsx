import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (session?.user?.id) redirect("/");
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      {children}
    </div>
  );
}
