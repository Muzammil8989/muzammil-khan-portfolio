"use client";

import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus, vs } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "next-themes";

interface CodeBlockProps {
  code: string;
  language: string;
  filename?: string;
  highlightedLines?: number[];
  showLineNumbers?: boolean;
}

export function CodeBlock({
  code,
  language,
  filename,
  highlightedLines = [],
  showLineNumbers = true,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Code copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy code");
    }
  };

  const customStyle = {
    margin: 0,

    padding: "1.5rem",
    fontSize: "0.875rem",
    lineHeight: "1.7",
  };

  return (
    <div className="relative group my-8 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-black/40 shadow-2xl transition-all duration-300">
      {/* Header with filename and copy button */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex gap-1.5 px-1">
            <div className="h-2.5 w-2.5 rounded-full bg-red-400/60 shadow-[0_0_8px_rgba(248,113,113,0.3)]" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-400/60 shadow-[0_0_8px_rgba(251,191,36,0.3)]" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/60 shadow-[0_0_8px_rgba(52,211,153,0.3)]" />
          </div>
          <span className="text-[10px] font-black font-mono text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] truncate">
            {language}
          </span>
          {filename && (
            <>
              <span className="text-slate-300 dark:text-slate-700">/</span>
              <span className="text-xs font-mono text-slate-600 dark:text-slate-400 truncate font-semibold">
                {filename}
              </span>
            </>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-8 px-3 transition-all bg-slate-100 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 sm:opacity-0 sm:group-hover:opacity-100 active:scale-95 flex-shrink-0 border border-transparent hover:border-slate-200 dark:hover:border-white/10"
        >
          {copied ? (
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <Check className="h-3.5 w-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Copied</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Copy className="h-3.5 w-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Copy</span>
            </div>
          )}
        </Button>
      </div>

      {/* Code block */}
      <div className="relative overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-800">
        <SyntaxHighlighter
          language={language}
          style={theme === "dark" ? vscDarkPlus : vs}
          showLineNumbers={showLineNumbers}
          wrapLines={true}
          wrapLongLines={true}
          lineProps={(lineNumber) => {
            const style: React.CSSProperties = { display: "block", width: "100%" };
            if (highlightedLines.includes(lineNumber)) {
              style.backgroundColor = theme === "dark" ? "rgba(59, 130, 246, 0.15)" : "rgba(59, 130, 246, 0.1)";
              style.borderLeft = "3px solid #6366f1";
            }
            return { style };
          }}
          customStyle={{
            ...customStyle,
            background: "transparent",
            padding: "1.5rem 1.25rem",
            margin: 0,
            width: "100%",
            minWidth: "100%",
            fontFamily: "var(--font-mono), monospace",
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
