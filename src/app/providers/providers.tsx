"use client";

import { usePathname } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SmoothCursor } from "@/components/ui/smooth-cursor";

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isRoot = pathname === "/";
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if window is defined (client-side)
    if (typeof window !== "undefined") {
      const checkIfMobile = () => {
        setIsMobile(window.innerWidth < 768); // 768px is typically the breakpoint for 'md' in Tailwind
      };

      // Initial check
      checkIfMobile();

      // Add event listener for window resize
      window.addEventListener("resize", checkIfMobile);

      // Cleanup
      return () => window.removeEventListener("resize", checkIfMobile);
    }
  }, []);

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
          {!isMobile && <SmoothCursor />} {/* Only show on non-mobile */}
          {isRoot && <Navbar />}
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
