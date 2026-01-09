"use client";

import { usePathname } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/layout";
import { ThemeProvider } from "@/components/shared";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isRoot = pathname === "/";
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkIfMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };

      checkIfMobile();
      window.addEventListener("resize", checkIfMobile);

      return () => window.removeEventListener("resize", checkIfMobile);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <SmoothScrollProvider>
          <TooltipProvider delayDuration={0}>
            {children}
            <Toaster />
            {isRoot && <Navbar />}
          </TooltipProvider>
        </SmoothScrollProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
