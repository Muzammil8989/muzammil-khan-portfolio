"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BlobUploader } from "@/components/ui/blob-uploader";
import { Profile } from "@/services/profile";

interface ProfileFormProps {
  profile?: Profile;
  onSubmit: (data: Omit<Profile, "_id">) => void;
  isSubmitting: boolean;
  onAvatarUpload: (url: string) => void;
  avatarUrl?: string;
}

export const ProfileForm = ({
  profile,
  onSubmit,
  isSubmitting,
  onAvatarUpload,
  avatarUrl = "",
}: ProfileFormProps) => {
  const [formData, setFormData] = useState<Omit<Profile, "_id">>({
    name: "",
    description: "",
    avatarUrl: "",
    initials: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        description: profile.description || "",
        avatarUrl: profile.avatarUrl || "",
        initials: profile.initials || "",
      });
    }
  }, [profile]);

  useEffect(() => {
    if (avatarUrl) {
      setFormData((prev) => ({ ...prev, avatarUrl }));
    }
  }, [avatarUrl]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "initials") {
      setFormData((prev) => ({
        ...prev,
        [name]: value.slice(0, 2).toUpperCase(),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Description is required");
      return;
    }

    if (!formData.initials || formData.initials.length !== 2) {
      toast.error("Initials must be exactly 2 characters");
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1 dark:text-slate-200">
          Name *
        </label>
        <Input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Enter full name"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1 dark:text-slate-200">
          Description *
        </label>
        <Textarea
          id="description"
          name="description"
          autoComplete="off"
          value={formData.description}
          onChange={handleChange}
          required
          placeholder="Enter profile description"
          rows={3}
        />
      </div>

      {/* Initials */}
      <div>
        <label htmlFor="initials" className="block text-sm font-medium mb-1 dark:text-slate-200">
          Initials *
        </label>
        <Input
          id="initials"
          name="initials"
          type="text"
          autoComplete="off"
          value={formData.initials}
          onChange={handleChange}
          required
          maxLength={2}
          placeholder="AB"
          className="uppercase"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Must be exactly 2 uppercase characters
        </p>
      </div>

      {/* Avatar Upload */}
      <div>
        <label className="block text-sm font-medium mb-1 dark:text-slate-200">
          Profile Picture
        </label>
        <BlobUploader
          buttonText={formData.avatarUrl ? "Change Image" : "Upload Image"}
          label=""
          onSuccess={(result: any) => {
            onAvatarUpload(result.secure_url);
            toast.success("Image uploaded successfully");
          }}
          onError={(error: any) => {
            const message = typeof error === "string" ? error : "Upload failed";
            toast.error(`Upload failed: ${message}`);
          }}
          folder="profile-avatars"
          className="mb-2"
        />

        {formData.avatarUrl && (
          <div className="mt-2 flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden border">
              <Image
                src={formData.avatarUrl}
                alt="Profile preview"
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => {
                setFormData((prev) => ({ ...prev, avatarUrl: "" }));
                onAvatarUpload("");
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
        ) : profile ? (
          "Update Profile"
        ) : (
          "Create Profile"
        )}
      </Button>
    </form>
  );
};
