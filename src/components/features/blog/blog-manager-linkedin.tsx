"use client";

import { Linkedin, Unlink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBlogManager } from "./blog-manager-context";

export function BlogManagerLinkedIn() {
  const {
    state: { linkedInStatus, disconnectLinkedIn },
  } = useBlogManager();

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border px-5 py-4 shadow-sm transition-colors ${
        linkedInStatus?.connected
          ? "border-[#0077B5]/30 bg-[#0077B5]/5"
          : "border-border bg-card"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`rounded-xl p-2.5 shrink-0 ${
            linkedInStatus?.connected ? "bg-[#0077B5]" : "bg-muted"
          }`}
        >
          <Linkedin
            className={`h-5 w-5 ${
              linkedInStatus?.connected ? "text-white" : "text-muted-foreground"
            }`}
          />
        </div>
        <div className="min-w-0">
          {linkedInStatus?.connected ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold">LinkedIn Connected</p>
                <span className="flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                Posting as{" "}
                <span className="text-[#0077B5] font-medium">
                  {linkedInStatus.name}
                </span>
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold">Connect LinkedIn</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Publish blog posts directly to your LinkedIn audience
              </p>
            </>
          )}
        </div>
      </div>

      {linkedInStatus?.connected ? (
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0 self-start sm:self-auto"
          onClick={() => disconnectLinkedIn.mutate()}
          disabled={disconnectLinkedIn.isPending}
        >
          <Unlink className="h-3.5 w-3.5" />
          Disconnect
        </Button>
      ) : (
        <Button
          size="sm"
          className="gap-2 bg-[#0077B5] hover:bg-[#006097] text-white shrink-0 shadow-sm self-start sm:self-auto"
          onClick={() => (window.location.href = "/api/linkedin/auth")}
        >
          <Linkedin className="h-3.5 w-3.5" />
          Connect
        </Button>
      )}
    </div>
  );
}
