"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CloudinaryUploader } from "@/components/ui/cloudinary-uploader";
import type { WorkExperience } from "@/services/work";

interface WorkExperienceFormProps {
  work?: WorkExperience;
  onSubmit: (data: Omit<WorkExperience, "_id">) => void;
  isSubmitting: boolean;
  onLogoUpload: (url: string) => void;
  logoUrl?: string;
}

export const WorkExperienceForm = ({
  work,
  onSubmit,
  isSubmitting,
  onLogoUpload,
  logoUrl = "",
}: WorkExperienceFormProps) => {
  const [formData, setFormData] = useState<Omit<WorkExperience, "_id">>({
    company: "",
    href: "",
    badges: [],
    location: "",
    title: "",
    logoUrl: "",
    start: "",
    end: "",
    description: "",
  });

  // hydrate when editing
  useEffect(() => {
    if (work) {
      setFormData({
        company: work.company ?? "",
        href: work.href ?? "",
        badges: Array.isArray(work.badges) ? work.badges : [],
        location: work.location ?? "",
        title: work.title ?? "",
        logoUrl: work.logoUrl ?? "",
        start: work.start ?? "",
        end: work.end ?? "",
        description: work.description ?? "",
      });
    }
  }, [work]);

  // Cloudinary logo override
  useEffect(() => {
    if (logoUrl) {
      setFormData((prev) => ({ ...prev, logoUrl }));
    }
  }, [logoUrl]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "badges") {
      const list = value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      setFormData((prev) => ({ ...prev, badges: list }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.company.trim()) {
      toast.error("Company is required");
      return;
    }
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!formData.start.trim()) {
      toast.error("Start is required (e.g., May 2021)");
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Company */}
      <div>
        <label htmlFor="company" className="block text-sm font-medium mb-1 dark:text-slate-200">
          Company *
        </label>
        <Input
          id="company"
          name="company"
          value={formData.company}
          onChange={handleChange}
          required
          placeholder="Atomic Finance"
        />
      </div>

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1 dark:text-slate-200">
          Title *
        </label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          placeholder="Bitcoin Protocol Engineer"
        />
      </div>

      {/* Location */}
      <div>
        <label htmlFor="location" className="block text-sm font-medium mb-1 dark:text-slate-200">
          Location
        </label>
        <Input
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Remote / City, Country"
        />
      </div>

      {/* Duration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="start" className="block text-sm font-medium mb-1 dark:text-slate-200">
            Start *
          </label>
          <Input
            id="start"
            name="start"
            value={formData.start}
            onChange={handleChange}
            required
            placeholder="May 2021"
          />
        </div>
        <div>
          <label htmlFor="end" className="block text-sm font-medium mb-1 dark:text-slate-200">
            End
          </label>
          <Input
            id="end"
            name="end"
            value={formData.end}
            onChange={handleChange}
            placeholder='Oct 2022 (or leave blank for "Present")'
          />
        </div>
      </div>

      {/* Company URL */}
      <div>
        <label htmlFor="href" className="block text-sm font-medium mb-1 dark:text-slate-200">
          Company Website
        </label>
        <Input
          id="href"
          name="href"
          type="url"
          value={formData.href}
          onChange={handleChange}
          placeholder="https://atomic.finance"
        />
      </div>

      {/* Badges (comma-separated) */}
      <div>
        <label htmlFor="badges" className="block text-sm font-medium mb-1 dark:text-slate-200">
          Badges (comma separated)
        </label>
        <Input
          id="badges"
          name="badges"
          value={formData.badges.join(", ")}
          onChange={handleChange}
          placeholder="Remote, Full-time, Contract"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Example: <code>Remote, Full-time</code>
        </p>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1 dark:text-slate-200">
          Description
        </label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="What did you build, ship, or own?"
          rows={4}
        />
      </div>

      {/* Logo Upload */}
      <div>
        <label className="block text-sm font-medium mb-1 dark:text-slate-200">Company Logo</label>
        <CloudinaryUploader
          buttonText={formData.logoUrl ? "Change Logo" : "Upload Logo"}
          label=""
          onSuccess={(result: any) => {
            const url = result?.secure_url;
            if (url) {
              onLogoUpload(url);
              toast.success("Logo uploaded successfully");
            } else {
              toast.error("Upload succeeded but no URL returned");
            }
          }}
          onError={(error: any) => {
            const message = typeof error === "string" ? error : "Upload failed";
            toast.error(`Upload failed: ${message}`);
          }}
          folder="company-logos"
          className="mb-2"
        />

        {formData.logoUrl && (
          <div className="mt-2 flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={formData.logoUrl}
              alt="Logo preview"
              className="w-16 h-16 rounded-md object-contain border bg-white"
            />
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => {
                setFormData((prev) => ({ ...prev, logoUrl: "" }));
                onLogoUpload("");
              }}
            >
              Remove
            </Button>
          </div>
        )}
      </div>

      {/* Submit */}
      <Button type="submit" disabled={isSubmitting} className="mt-4 w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : work ? (
          "Update Experience"
        ) : (
          "Create Experience"
        )}
      </Button>
    </form>
  );
};
