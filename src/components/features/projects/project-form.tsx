"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Globe, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CloudinaryUploader } from "@/components/ui/cloudinary-uploader";
import { Project, ProjectLink } from "@/services/project";

interface ProjectFormProps {
    project?: Project;
    onSubmit: (data: Omit<Project, "_id">) => void;
    isSubmitting: boolean;
}

export const ProjectForm = ({
    project,
    onSubmit,
    isSubmitting,
}: ProjectFormProps) => {
    const [formData, setFormData] = useState<Omit<Project, "_id">>({
        title: "",
        href: "",
        dates: "",
        active: true,
        description: "",
        technologies: [],
        links: [],
        image: "",
        video: "",
    });

    const [techInput, setTechInput] = useState("");

    useEffect(() => {
        if (project) {
            setFormData({
                title: project.title || "",
                href: project.href || "",
                dates: project.dates || "",
                active: project.active ?? true,
                description: project.description || "",
                technologies: project.technologies || [],
                links: project.links || [],
                image: project.image || "",
                video: project.video || "",
            });
            setTechInput(project.technologies.join(", "));
        }
    }, [project]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleTechChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTechInput(e.target.value);
        const list = e.target.value
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
        setFormData((prev) => ({ ...prev, technologies: list }));
    };

    const addLink = () => {
        setFormData((prev) => ({
            ...prev,
            links: [...prev.links, { type: "Website", href: "" }],
        }));
    };

    const updateLink = (index: number, field: keyof ProjectLink, value: string) => {
        const newLinks = [...formData.links];
        newLinks[index] = { ...newLinks[index], [field]: value };
        setFormData((prev) => ({ ...prev, links: newLinks }));
    };

    const removeLink = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            links: prev.links.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim()) return toast.error("Title is required");
        if (formData.technologies.length === 0) return toast.error("At least one technology is required");
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium mb-1 block dark:text-slate-200">Title *</label>
                    <Input name="title" value={formData.title} onChange={handleChange} required placeholder="Chat Collect" />
                </div>
                <div>
                    <label className="text-sm font-medium mb-1 block dark:text-slate-200">Dates *</label>
                    <Input name="dates" value={formData.dates} onChange={handleChange} required placeholder="Jan 2024 - Feb 2024" />
                </div>
            </div>

            <div>
                <label className="text-sm font-medium mb-1 block dark:text-slate-200">Project URL (Main)</label>
                <Input name="href" value={formData.href} onChange={handleChange} type="url" placeholder="https://chatcollect.com" />
            </div>

            <div>
                <label className="text-sm font-medium mb-1 block dark:text-slate-200">Technologies (comma separated) *</label>
                <Input value={techInput} onChange={handleTechChange} placeholder="Next.js, Typescript, TailwindCSS" />
            </div>

            <div>
                <label className="text-sm font-medium mb-1 block dark:text-slate-200">Description *</label>
                <Textarea name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="Describe your masterpiece..." />
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium dark:text-slate-200">Project Links</label>
                    <Button type="button" variant="outline" size="sm" onClick={addLink}>
                        <Plus className="h-4 w-4 mr-1" /> Add Link
                    </Button>
                </div>
                {formData.links.map((link, index) => (
                    <div key={index} className="flex gap-2 items-center">
                        <Input
                            className="flex-1"
                            placeholder="Label (e.g. Website, Source)"
                            value={link.type}
                            onChange={(e) => updateLink(index, "type", e.target.value)}
                        />
                        <Input
                            className="flex-[2]"
                            placeholder="https://..."
                            value={link.href}
                            onChange={(e) => updateLink(index, "href", e.target.value)}
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeLink(index)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div>
                    <label className="text-sm font-medium mb-2 block dark:text-slate-200">Project Image</label>
                    <CloudinaryUploader
                        buttonText={formData.image ? "Change Image" : "Upload Image"}
                        onSuccess={(res: any) => setFormData(p => ({ ...p, image: res.secure_url }))}
                        folder="projects"
                    />
                    {formData.image && (
                        <div className="mt-2 relative group w-full h-32 rounded-lg border overflow-hidden">
                            <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                            <Button
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                size="icon" variant="destructive"
                                onClick={() => setFormData(p => ({ ...p, image: "" }))}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
                <div>
                    <label className="text-sm font-medium mb-2 block dark:text-slate-200">Project Video URL (Direct link)</label>
                    <Input name="video" value={formData.video} onChange={handleChange} placeholder="https://example.com/demo.mp4" />
                    <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-1">Direct URL to an mp4 file for the video preview.</p>
                </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600">
                {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : project ? "Update Project" : "Create Project"}
            </Button>
        </form>
    );
};
