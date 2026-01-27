// components/signout-button.tsx
"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
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
      onClick={handleSignOut}
      className="bg-blue-600 text-white hover:bg-blue-700 shadow-md transition-all duration-300"
    >
      Sign Out
    </Button>
  );
}
