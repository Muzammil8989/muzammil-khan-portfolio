"use client";

import { Linkedin, Unlink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBlogManager } from "./blog-manager-context";

export function BlogManagerLinkedIn() {
  const {
    state: { linkedInStatus, disconnectLinkedIn },
  } = useBlogManager();

  const connected = linkedInStatus?.connected;

  return (
    <div
      className={`flex items-center gap-2 rounded-xl border px-3 py-2 h-10 shrink-0 transition-colors ${
        connected
          ? "border-[#0077B5]/30 bg-[#0077B5]/5"
          : "border-border bg-card"
      }`}
    >
      {/* Icon */}
      <div className={`rounded-lg p-1 shrink-0 ${connected ? "bg-[#0077B5]" : "bg-muted"}`}>
        <Linkedin className={`h-3.5 w-3.5 ${connected ? "text-white" : "text-muted-foreground"}`} />
      </div>

      {connected ? (
        <>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs font-semibold text-foreground whitespace-nowrap">LinkedIn</span>
            <span className="flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide whitespace-nowrap">
              <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
              LIVE
            </span>
            <span className="text-[10px] text-muted-foreground hidden md:inline">·</span>
            <span className="text-[10px] text-[#0077B5] hidden md:inline truncate max-w-[120px]">
              {linkedInStatus.name}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-red-500 shrink-0 ml-0.5"
            onClick={() => disconnectLinkedIn.mutate()}
            disabled={disconnectLinkedIn.isPending}
            title="Disconnect LinkedIn"
          >
            <Unlink className="h-3 w-3" />
          </Button>
        </>
      ) : (
        <>
          <span className="text-xs font-medium whitespace-nowrap text-muted-foreground">LinkedIn</span>
          <Button
            size="sm"
            className="h-7 bg-[#0077B5] hover:bg-[#006097] text-white text-xs px-2 shrink-0"
            onClick={() => (window.location.href = "/api/linkedin/auth")}
          >
            Connect
          </Button>
        </>
      )}
    </div>
  );
}
