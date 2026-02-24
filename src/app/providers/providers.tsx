"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/shared";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";

export function Providers({ children }: { children: ReactNode }) {
  // Create QueryClient per-component instance to avoid shared state across SSR requests
  const [queryClient] = useState(() => new QueryClient());

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
          </TooltipProvider>
        </SmoothScrollProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
