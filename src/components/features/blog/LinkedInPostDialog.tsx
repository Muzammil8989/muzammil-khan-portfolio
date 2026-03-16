"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Linkedin, X, Upload, ExternalLink, ImageIcon, Loader2, Bold } from "lucide-react";
import { Blog } from "@/services/blog";
import { useLinkedInPublish } from "@/app/hooks/useLinkedIn";

interface LinkedInPostDialogProps {
  blog: Blog;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MAX_IMAGES = 9;
const MAX_CHARS = 3000;

function toUnicodeBold(text: string): string {
  return text.split("").map((char) => {
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) return String.fromCodePoint(0x1d5d4 + (code - 65)); // A-Z
    if (code >= 97 && code <= 122) return String.fromCodePoint(0x1d5ee + (code - 97)); // a-z
    if (code >= 48 && code <= 57) return String.fromCodePoint(0x1d7ec + (code - 48));  // 0-9
    return char;
  }).join("");
}

function buildDefaultText(blog: Blog): string {
  const tagsLine = blog.tags.slice(0, 5).map((t) => `#${t.replace(/\s+/g, "")}`).join(" ");

  return `${blog.excerpt || blog.title}

Full article link in the comments 👇

${tagsLine}`;
}

export function LinkedInPostDialog({ blog, open, onOpenChange }: LinkedInPostDialogProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const blogUrl = `${siteUrl}/blog/${blog.slug}`;

  const [postText, setPostText] = useState(() => buildDefaultText(blog));
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const publish = useLinkedInPublish();

  const handleBold = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start === end) return;
    const bolded = toUnicodeBold(postText.slice(start, end));
    const newText = postText.slice(0, start) + bolded + postText.slice(end);
    setPostText(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + bolded.length);
    }, 0);
  };

  const handleImageAdd = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const remaining = MAX_IMAGES - images.length;
      const toAdd = Array.from(files).slice(0, remaining);
      const newPreviews = toAdd.map((f) => URL.createObjectURL(f));
      setImages((prev) => [...prev, ...toAdd]);
      setPreviews((prev) => [...prev, ...newPreviews]);
    },
    [images.length]
  );

  const handleRemoveImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleImageAdd(e.dataTransfer.files);
  };

  const handleSubmit = () => {
    publish.mutate(
      { blogId: blog._id, postText, images },
      {
        onSuccess: () => {
          onOpenChange(false);
          setImages([]);
          setPreviews([]);
          setPostText(buildDefaultText(blog));
        },
      }
    );
  };

  const charsLeft = MAX_CHARS - postText.length;
  const isOverLimit = charsLeft < 0;
  const canSubmit = postText.trim().length > 0 && !isOverLimit && !publish.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-xl p-0 flex flex-col max-h-[90vh]">
        <div className="flex-none px-6 pt-6 pb-4 border-b border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Linkedin className="h-5 w-5 text-[#0077B5]" />
              Post to LinkedIn
            </DialogTitle>
            <DialogDescription>
              Share{" "}
              <span className="font-medium text-foreground">"{blog.title}"</span> on LinkedIn.
              The blog link is automatically posted as the first comment for maximum reach.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 px-6 py-5">
        <div className="space-y-5">
          {/* Blog link info */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              Auto-comment:{" "}
              <a href={blogUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                {blogUrl}
              </a>
            </span>
          </div>

          {/* Post text */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Post Text</label>
              <button
                type="button"
                onClick={handleBold}
                title="Bold selected text (Unicode bold)"
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground border border-border rounded px-2 py-1 hover:bg-muted/50 transition-colors"
              >
                <Bold className="h-3.5 w-3.5" />
                Bold
              </button>
            </div>
            <textarea
              ref={textareaRef}
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              rows={9}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              placeholder="Write your LinkedIn post…"
            />
            <p className={`text-xs text-right ${isOverLimit ? "text-red-500" : "text-muted-foreground"}`}>
              {charsLeft} characters remaining · Select text then click Bold to make it 𝗯𝗼𝗹𝗱
            </p>
          </div>

          {/* Image uploader */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Images{" "}
              <span className="text-muted-foreground font-normal">
                (optional, {images.length}/{MAX_IMAGES})
              </span>
            </label>

            {previews.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {previews.map((src, i) => (
                  <div key={i} className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`Preview ${i + 1}`}
                      className="h-20 w-20 object-cover rounded-lg border border-border"
                    />
                    <button
                      onClick={() => handleRemoveImage(i)}
                      className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                {images.length < MAX_IMAGES && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="h-20 w-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:border-[#0077B5] hover:text-[#0077B5] transition-colors"
                  >
                    <Upload className="h-5 w-5" />
                  </button>
                )}
              </div>
            )}

            {previews.length === 0 && (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-[#0077B5] hover:bg-muted/30 transition-colors"
              >
                <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Drag & drop images here, or <span className="text-[#0077B5] underline">click to browse</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Up to 9 images · JPG, PNG, GIF, WebP
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              multiple
              className="hidden"
              onChange={(e) => handleImageAdd(e.target.files)}
            />
          </div>

          {/* Post preview info */}
          <div className="bg-[#0077B5]/5 border border-[#0077B5]/20 rounded-lg px-4 py-3 text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground text-sm">What LinkedIn users will see:</p>
            <p>
              Your post text{images.length > 0 ? ` with ${images.length} image${images.length > 1 ? "s" : ""}` : ""} — no link in the post body.
              The blog URL is automatically posted as the <span className="font-medium text-foreground">first comment</span>, which gets more reach from LinkedIn's algorithm.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-1">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={publish.isPending}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="bg-[#0077B5] hover:bg-[#006097] text-white"
            >
              {publish.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting…
                </>
              ) : (
                <>
                  <Linkedin className="mr-2 h-4 w-4" />
                  {images.length > 0
                    ? `Post with ${images.length} image${images.length > 1 ? "s" : ""}`
                    : "Post to LinkedIn"}
                </>
              )}
            </Button>
          </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
