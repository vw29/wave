import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-row justify-between gap-4 p-4 bg-card">
      <h1 className="text-2xl font-bold text-white">Home</h1>

      <div>
        <ul className="flex gap-4 text-white">
          <li>
            <Link href="/login">Login</Link>
          </li>
          <li>
            <Link href="/my-account">My Account</Link>
          </li>
        </ul>
      </div>
      
    </div>
  );
}
