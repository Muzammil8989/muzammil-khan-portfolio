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
      variant="outline"
      onClick={handleSignOut}
      className="border-slate-300 bg-white text-slate-700 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
    >
      Sign Out
    </Button>
  );
}
