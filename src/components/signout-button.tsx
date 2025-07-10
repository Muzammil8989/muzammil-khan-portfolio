// components/signout-button.tsx
"use client";

import { signOut } from "next-auth/react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({
      redirect: false,
    });
    router.push("/signin");
  };

  return (
    <Button
      variant="outline"
      onClick={handleSignOut}
      className="hover:bg-red-50 hover:text-red-600"
    >
      Sign Out
    </Button>
  );
}
