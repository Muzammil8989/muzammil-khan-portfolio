"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Plus } from "lucide-react";
import { CodeBlock } from "@/core/validation/blog";

interface CodeBlockEditorProps {
  codeBlocks: CodeBlock[];
  onChange: (codeBlocks: CodeBlock[]) => void;
}

const PROGRAMMING_LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "java",
  "csharp",
  "cpp",
  "c",
  "go",
  "rust",
  "php",
  "ruby",
  "swift",
  "kotlin",
  "dart",
  "html",
  "css",
  "scss",
  "json",
  "yaml",
  "markdown",
  "bash",
  "sql",
  "graphql",
];

export function CodeBlockEditor({ codeBlocks, onChange }: CodeBlockEditorProps) {
  const [newBlock, setNewBlock] = useState<Partial<CodeBlock>>({
    language: "javascript",
    code: "",
    filename: "",
    highlightedLines: [],
  });

  const handleAddBlock = () => {
    if (!newBlock.code || !newBlock.language) {
      return;
    }

    const block: CodeBlock = {
      language: newBlock.language,
      code: newBlock.code,
      filename: newBlock.filename,
      highlightedLines: newBlock.highlightedLines,
    };

    onChange([...codeBlocks, block]);

    // Reset form
    setNewBlock({
      language: "javascript",
      code: "",
      filename: "",
      highlightedLines: [],
    });
  };

  const handleRemoveBlock = (index: number) => {
    const updated = codeBlocks.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleUpdateBlock = (index: number, updatedBlock: Partial<CodeBlock>) => {
    const updated = codeBlocks.map((block, i) =>
      i === index ? { ...block, ...updatedBlock } : block
    );
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Code Blocks</Label>
        <span className="text-xs text-muted-foreground">
          {codeBlocks.length} block{codeBlocks.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Existing Code Blocks */}
      {codeBlocks.length > 0 && (
        <div className="space-y-3">
          {codeBlocks.map((block, index) => (
            <Card key={index} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-medium">
                      {block.language}
                      {block.filename && (
                        <span className="ml-2 text-xs text-muted-foreground font-normal">
                          {block.filename}
                        </span>
                      )}
                    </CardTitle>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveBlock(index)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <pre className="bg-muted p-3 rounded-md overflow-x-auto">
                  <code className="text-xs">
                    {block.code.substring(0, 200)}
                    {block.code.length > 200 && "..."}
                  </code>
                </pre>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add New Code Block Form */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Add New Code Block</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Language *</Label>
              <Select
                value={newBlock.language}
                onValueChange={(value) =>
                  setNewBlock({ ...newBlock, language: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {PROGRAMMING_LANGUAGES.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Filename (optional)</Label>
              <Input
                placeholder="example.js"
                value={newBlock.filename || ""}
                onChange={(e) =>
                  setNewBlock({ ...newBlock, filename: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Code *</Label>
            <Textarea
              placeholder="Paste your code here..."
              value={newBlock.code || ""}
              onChange={(e) => setNewBlock({ ...newBlock, code: e.target.value })}
              rows={8}
              className="font-mono text-xs"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">
              Highlighted Lines (optional, comma-separated)
            </Label>
            <Input
              placeholder="1, 3, 5-7"
              value={newBlock.highlightedLines?.join(", ") || ""}
              onChange={(e) => {
                const lines = e.target.value
                  .split(",")
                  .map((s) => {
                    const trimmed = s.trim();
                    // Handle ranges like "5-7"
                    if (trimmed.includes("-")) {
                      const [start, end] = trimmed.split("-").map(Number);
                      return Array.from(
                        { length: end - start + 1 },
                        (_, i) => start + i
                      );
                    }
                    return Number(trimmed);
                  })
                  .flat()
                  .filter((n) => !isNaN(n));

                setNewBlock({ ...newBlock, highlightedLines: lines });
              }}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="button"
            onClick={handleAddBlock}
            disabled={!newBlock.code || !newBlock.language}
            className="w-full"
            variant="secondary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Code Block
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
