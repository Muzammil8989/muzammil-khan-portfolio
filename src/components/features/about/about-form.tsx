"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { About } from "@/services/about";

interface AboutFormProps {
  about?: About;
  onSubmit: (data: Omit<About, "_id">) => void;
  isSubmitting: boolean;
}

export const AboutForm = ({
  about,
  onSubmit,
  isSubmitting,
}: AboutFormProps) => {
  const [formData, setFormData] = useState<Omit<About, "_id">>({
    message: "",
  });

  useEffect(() => {
    if (about) {
      setFormData({
        message: about.message || "",
      });
    }
  }, [about]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.message.trim()) {
      toast.error("Message is required");
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-1">
          About Message *
        </label>
        <Textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          placeholder="Enter your about message..."
          rows={8}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground mt-1">
          This message will be displayed in the About section
        </p>
      </div>

      {/* Submit */}
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : about ? (
          "Update About"
        ) : (
          "Create About"
        )}
      </Button>
    </form>
  );
};
