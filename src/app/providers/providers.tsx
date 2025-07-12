"use client";

import { usePathname } from "next/navigation"; // ✅
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  const pathname = usePathname(); // ✅ Get current route

  const isRoot = pathname === "/"; // ✅ Check if we are on root route

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <TooltipProvider delayDuration={0}>
          {children}
          <Toaster />
          {isRoot && <Navbar />} {/* ✅ Show Navbar only on "/" */}
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
