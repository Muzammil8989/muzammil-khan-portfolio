"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ContactSchema, type ContactInput } from "@/core/validation/contact";
import { Button } from "@/components/ui/button";
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">Your Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="John Doe"
                    {...field}
                    disabled={isSubmitting}
                    className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10 focus:border-indigo-500 dark:focus:border-blue-500 focus:ring-indigo-500/20 dark:focus:ring-blue-500/20 transition-all"
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
                <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">Email Address</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    {...field}
                    disabled={isSubmitting}
                    className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10 focus:border-indigo-500 dark:focus:border-blue-500 focus:ring-indigo-500/20 dark:focus:ring-blue-500/20 transition-all"
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
              <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">Subject</FormLabel>
              <FormControl>
                <Input
                  placeholder="Project inquiry, collaboration, or just say hi!"
                  {...field}
                  disabled={isSubmitting}
                  className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10 focus:border-indigo-500 dark:focus:border-blue-500 focus:ring-indigo-500/20 dark:focus:ring-blue-500/20 transition-all"
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
              <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell me about your project, ideas, or how we can collaborate..."
                  className="min-h-[180px] resize-none bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10 focus:border-indigo-500 dark:focus:border-blue-500 focus:ring-indigo-500/20 dark:focus:ring-blue-500/20 transition-all"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-blue-500/30 dark:shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/40 dark:hover:shadow-blue-500/30 transition-all duration-300"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending your message...
            </>
          ) : (
            <>
              <Send className="mr-2 h-5 w-5" />
              Send Message
            </>
          )}
        </Button>

        <p className="text-xs text-center text-slate-500 dark:text-slate-400">
          I typically respond within 24-48 hours. Looking forward to connecting!
        </p>
      </form>
    </Form>
  );
}
