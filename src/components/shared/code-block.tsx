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
    borderRadius: "0.5rem",
    padding: "1.5rem",
    fontSize: "0.875rem",
    lineHeight: "1.7",
  };

  return (
    <div className="relative group my-6 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
      {/* Header with filename and copy button */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            {language}
          </span>
          {filename && (
            <>
              <span className="text-muted-foreground">•</span>
              <span className="text-xs font-mono text-slate-700 dark:text-slate-300">
                {filename}
              </span>
            </>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-xs">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-xs">Copy</span>
            </>
          )}
        </Button>
      </div>

      {/* Code block */}
      <div className="overflow-x-auto">
        <SyntaxHighlighter
          language={language}
          style={theme === "dark" ? vscDarkPlus : vs}
          showLineNumbers={showLineNumbers}
          wrapLines={highlightedLines.length > 0}
          lineProps={(lineNumber) => {
            const style: React.CSSProperties = {};
            if (highlightedLines.includes(lineNumber)) {
              style.backgroundColor = theme === "dark" ? "rgba(59, 130, 246, 0.15)" : "rgba(59, 130, 246, 0.1)";
              style.display = "block";
              style.width = "100%";
            }
            return { style };
          }}
          customStyle={customStyle}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
