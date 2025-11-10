"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CloudinaryUploader } from "@/components/ui/cloudinary-uploader";
import type { Education } from "@/services/educations";

interface EducationFormProps {
  education?: Education;
  onSubmit: (data: Omit<Education, "_id">) => void;
  isSubmitting: boolean;
  onLogoUpload: (url: string) => void;
  logoUrl?: string;
}

export const EducationForm = ({
  education,
  onSubmit,
  isSubmitting,
  onLogoUpload,
  logoUrl = "",
}: EducationFormProps) => {
  const [formData, setFormData] = useState<Omit<Education, "_id">>({
    school: "",
    href: "",
    degree: "",
    logoUrl: "",
    start: "",
    end: "",
  });

  // hydrate when editing
  useEffect(() => {
    if (education) {
      setFormData({
        school: education.school ?? "",
        href: education.href ?? "",
        degree: education.degree ?? "",
        logoUrl: education.logoUrl ?? "",
        start: education.start ?? "",
        end: education.end ?? "",
      });
    }
  }, [education]);

  // Cloudinary logo override
  useEffect(() => {
    if (logoUrl) {
      setFormData((prev) => ({ ...prev, logoUrl }));
    }
  }, [logoUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.school.trim()) {
      toast.error("School is required");
      return;
    }
    if (!formData.degree.trim()) {
      toast.error("Degree is required");
      return;
    }
    if (!formData.start.trim()) {
      toast.error("Start is required (e.g., 2016 or Sep 2016)");
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* School */}
      <div>
        <label htmlFor="school" className="block text-sm font-medium mb-1">
          School *
        </label>
        <Input
          id="school"
          name="school"
          value={formData.school}
          onChange={handleChange}
          required
          placeholder="Wilfrid Laurier University"
        />
      </div>

      {/* Degree */}
      <div>
        <label htmlFor="degree" className="block text-sm font-medium mb-1">
          Degree *
        </label>
        <Input
          id="degree"
          name="degree"
          value={formData.degree}
          onChange={handleChange}
          required
          placeholder="Bachelor's Degree of Business Administration (BBA)"
        />
      </div>

      {/* Duration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="start" className="block text-sm font-medium mb-1">
            Start *
          </label>
          <Input
            id="start"
            name="start"
            value={formData.start}
            onChange={handleChange}
            required
            placeholder="2016 or Sep 2016"
          />
        </div>
        <div>
          <label htmlFor="end" className="block text-sm font-medium mb-1">
            End
          </label>
          <Input
            id="end"
            name="end"
            value={formData.end}
            onChange={handleChange}
            placeholder='2021 (or leave blank for "Present")'
          />
        </div>
      </div>

      {/* School URL */}
      <div>
        <label htmlFor="href" className="block text-sm font-medium mb-1">
          School Website
        </label>
        <Input
          id="href"
          name="href"
          type="url"
          value={formData.href}
          onChange={handleChange}
          placeholder="https://wlu.ca"
        />
      </div>

      {/* Logo Upload */}
      <div>
        <label className="block text-sm font-medium mb-1">School Logo</label>
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
          folder="education-logos"
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
        ) : education ? (
          "Update Education"
        ) : (
          "Create Education"
        )}
      </Button>
    </form>
  );
};
