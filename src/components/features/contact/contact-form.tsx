"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ContactSchema, type ContactInput } from "@/core/validation/contact";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import axios from "axios";

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactInput>({
    resolver: zodResolver(ContactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactInput) => {
    setIsSubmitting(true);
    try {
      await axios.post("/api/contact", data);
      toast.success("Message sent successfully!", {
        description: "Thank you for contacting me. I'll get back to you soon.",
      });
      form.reset();
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message", {
        description: "Please try again later or contact me directly via email.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "transition-all duration-200 bg-transparent border text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus-visible:ring-1 focus-visible:ring-[#FFB902] focus-visible:border-[#FFB902]";
  const inputStyle = { borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[13px] font-semibold" style={{ color: "var(--text-secondary)" }}>Your Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="John Doe"
                    {...field}
                    disabled={isSubmitting}
                    className={inputClass}
                    style={inputStyle}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[13px] font-semibold" style={{ color: "var(--text-secondary)" }}>Email Address</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    {...field}
                    disabled={isSubmitting}
                    className={inputClass}
                    style={inputStyle}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[13px] font-semibold" style={{ color: "var(--text-secondary)" }}>Subject</FormLabel>
              <FormControl>
                <Input
                  placeholder="Project inquiry, collaboration, or just say hi!"
                  {...field}
                  disabled={isSubmitting}
                  className={inputClass}
                  style={inputStyle}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[13px] font-semibold" style={{ color: "var(--text-secondary)" }}>Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell me about your project, ideas, or how we can collaborate..."
                  className={`min-h-[180px] resize-none ${inputClass}`}
                  style={inputStyle}
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 rounded-[12px] text-[14px] font-black flex items-center justify-center gap-2 transition-opacity duration-200 hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: "#FFB902", color: "#04061a" }}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending your message...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Send Message
            </>
          )}
        </button>

        <p className="text-xs text-center" style={{ color: "var(--text-tertiary)" }}>
          I typically respond within 24-48 hours. Looking forward to connecting!
        </p>
      </form>
    </Form>
  );
}
