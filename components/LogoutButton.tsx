import { logoutUser } from "@/actions/auth/logout";
import { Button } from "./ui/button";

export default function LogoutButton() {
  return (
    <form action={logoutUser}>
      <Button type="submit" variant="default">
        Logout
      </Button>
    </form>
  );
}
