import { auth } from "@/auth";
import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return (
    <main className="flex flex-col h-screen">
      <nav className="flex items-center justify-between p-4 bg-muted">
        <ul className="flex items-center gap-4">
          <li>
            <Link href="/my-account">My Account</Link>
          </li>
          <li>
            <Link href="/change-password">Change Password</Link>
          </li>
        </ul>
        <LogoutButton />
      </nav>
      <div className="flex-1 flex justify-center items-center">{children}</div>
    </main>
  );
}
