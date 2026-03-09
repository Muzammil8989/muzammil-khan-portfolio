"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ModeToggle } from "@/components/shared";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  User,
  Briefcase,
  GraduationCap,
  FileText,
  Code2,
  Wrench,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
} from "lucide-react";

// ─────────────────────────────────────────────
// Nav config
// ─────────────────────────────────────────────
const NAV_ITEMS = [
  { href: "/dashboard/profiles",  label: "Profiles",  icon: User,          desc: "Manage your profile info"  },
  { href: "/dashboard/work",      label: "Work",       icon: Briefcase,     desc: "Work experience entries"   },
  { href: "/dashboard/education", label: "Education",  icon: GraduationCap, desc: "Education history"         },
  { href: "/dashboard/about",     label: "About",      icon: FileText,      desc: "About section content"     },
  { href: "/dashboard/projects",  label: "Projects",   icon: Code2,         desc: "Portfolio projects"        },
  { href: "/dashboard/skills",    label: "Skills",     icon: Wrench,        desc: "Technical skills"          },
  { href: "/dashboard/blogs",     label: "Blog",       icon: BookOpen,      desc: "Blog posts & publishing"   },
] as const;

// ─────────────────────────────────────────────
// DashboardShell – sidebar + header + {children}
// ─────────────────────────────────────────────
export function DashboardShell({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeItem = NAV_ITEMS.find((i) => pathname.startsWith(i.href)) ?? NAV_ITEMS[0];
  const ActiveIcon = activeItem.icon;

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/signin");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ══════════════════════════════════════
          SIDEBAR
      ══════════════════════════════════════ */}
      <aside
        className={cn(
          "flex flex-col shrink-0",
          "bg-white dark:bg-slate-900",
          "border-r border-slate-200 dark:border-slate-800",
          // Mobile: fixed overlay, hidden by default
          "fixed inset-y-0 left-0 z-50 w-[220px]",
          "transition-transform duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop: relative, collapsible width
          "md:relative md:translate-x-0 md:transition-[width] md:duration-300 md:ease-in-out",
          collapsed ? "md:w-[60px]" : "md:w-[220px]"
        )}
      >
        {/* Brand */}
        <div className="flex items-center gap-2.5 h-14 px-3 border-b border-slate-200 dark:border-slate-800 shrink-0 overflow-hidden">
          <div className="p-1.5 rounded-lg shrink-0" style={{ background: "#FFB902" }}>
            <LayoutDashboard className="h-4 w-4" style={{ color: "#04061a" }} />
          </div>
          <div
            className={cn(
              "flex flex-col overflow-hidden transition-all duration-200",
              collapsed ? "w-0 opacity-0" : "w-full opacity-100"
            )}
          >
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap leading-tight">
              Admin CMS
            </span>
            <span className="text-[10px] text-slate-400 whitespace-nowrap leading-tight">
              Portfolio Manager
            </span>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto overflow-x-hidden">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href);

            const navLink = (
              <Link
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                  collapsed ? "justify-center" : "justify-start",
                  isActive
                    ? "text-[#04061a] dark:text-[#04061a]"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                )}
                style={isActive ? { background: "#FFB902" } : undefined}
              >
                <Icon
                  className={cn(
                    "shrink-0 transition-all",
                    collapsed ? "h-[18px] w-[18px]" : "h-4 w-4",
                  )}
                  style={isActive ? { color: "#04061a" } : undefined}
                />
                <span
                  className={cn(
                    "whitespace-nowrap transition-all duration-200 overflow-hidden",
                    collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                  )}
                >
                  {label}
                </span>
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={href} delayDuration={0}>
                  <TooltipTrigger asChild>{navLink}</TooltipTrigger>
                  <TooltipContent side="right" className="font-medium text-xs">
                    {label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return <div key={href}>{navLink}</div>;
          })}
        </nav>

        {/* Bottom: Theme + Sign Out */}
        <div
          className={cn(
            "flex items-center border-t border-slate-200 dark:border-slate-800 p-2 gap-1 shrink-0 overflow-hidden",
            collapsed ? "flex-col" : "flex-row"
          )}
        >
          {collapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <div><ModeToggle /></div>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium">
                Toggle Theme
              </TooltipContent>
            </Tooltip>
          ) : (
            <ModeToggle />
          )}

          {collapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSignOut}
                  className="h-9 w-9 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium">
                Sign Out
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="ml-auto gap-1.5 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs font-medium"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </Button>
          )}
        </div>

        {/* Floating collapse toggle – desktop only */}
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <button
              onClick={() => setCollapsed((c) => !c)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className={cn(
                "hidden md:flex absolute -right-3 top-[52px] z-20",
                "h-6 w-6 items-center justify-center",
                "rounded-full border border-slate-200 dark:border-slate-700",
                "bg-white dark:bg-slate-900",
                "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200",
                "shadow-sm hover:shadow transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB902]"
              )}
            >
              {collapsed ? (
                <ChevronRight className="h-3 w-3" />
              ) : (
                <ChevronLeft className="h-3 w-3" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs">
            {collapsed ? "Expand sidebar" : "Collapse sidebar"}
          </TooltipContent>
        </Tooltip>
      </aside>

      {/* ══════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Page header */}
        <header className="flex items-center h-14 px-4 md:px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 gap-3">
          {/* Hamburger – mobile only */}
          <button
            onClick={() => setMobileOpen(true)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className="md:hidden flex items-center justify-center h-8 w-8 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB902]"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
          <ActiveIcon className="h-4 w-4 shrink-0" style={{ color: "#FFB902" }} />
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
              {activeItem.label}
            </h1>
            <p className="text-[11px] text-slate-500 leading-tight">{activeItem.desc}</p>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 flex flex-col overflow-hidden p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
