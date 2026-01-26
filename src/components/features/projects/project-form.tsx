"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Globe, Github } from "lucide-react";
import Image from "next/image";
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
        projectUrl: "",
        githubUrl: "",
        caseStudyUrl: "",
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
                projectUrl: (project as any).projectUrl || "",
                githubUrl: (project as any).githubUrl || "",
                caseStudyUrl: (project as any).caseStudyUrl || "",
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
                    <label htmlFor="title" className="text-sm font-medium mb-1 block dark:text-slate-200">Title *</label>
                    <Input id="title" name="title" type="text" autoComplete="off" value={formData.title} onChange={handleChange} required placeholder="Chat Collect" />
                </div>
                <div>
                    <label htmlFor="dates" className="text-sm font-medium mb-1 block dark:text-slate-200">Dates *</label>
                    <Input id="dates" name="dates" type="text" autoComplete="off" value={formData.dates} onChange={handleChange} required placeholder="Jan 2024 - Feb 2024" />
                </div>
            </div>

            <div>
                <label htmlFor="description" className="text-sm font-medium mb-1 block dark:text-slate-200">Description *</label>
                <Textarea id="description" name="description" autoComplete="off" value={formData.description} onChange={handleChange} rows={3} placeholder="Describe your project..." />
            </div>

            <div>
                <label htmlFor="technologies" className="text-sm font-medium mb-1 block dark:text-slate-200">Technologies *</label>
                <Input id="technologies" name="technologies" type="text" autoComplete="off" value={techInput} onChange={handleTechChange} placeholder="Next.js, TypeScript, TailwindCSS" />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Comma separated list</p>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <h3 className="text-sm font-semibold mb-3 text-slate-900 dark:text-white">Project Links</h3>
                <div className="grid grid-cols-1 gap-3">
                    <div>
                        <label htmlFor="projectUrl" className="text-xs font-medium mb-1.5 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <Globe className="h-3.5 w-3.5" />
                            Live Demo URL
                        </label>
                        <Input id="projectUrl" name="projectUrl" value={formData.projectUrl} onChange={handleChange} type="url" autoComplete="url" placeholder="https://your-project.com" />
                    </div>
                    <div>
                        <label htmlFor="githubUrl" className="text-xs font-medium mb-1.5 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <Github className="h-3.5 w-3.5" />
                            GitHub Repository
                        </label>
                        <Input id="githubUrl" name="githubUrl" value={formData.githubUrl} onChange={handleChange} type="url" autoComplete="url" placeholder="https://github.com/username/repo" />
                    </div>
                    <div>
                        <label htmlFor="caseStudyUrl" className="text-xs font-medium mb-1.5 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Case Study / Article
                        </label>
                        <Input id="caseStudyUrl" name="caseStudyUrl" value={formData.caseStudyUrl} onChange={handleChange} type="url" autoComplete="url" placeholder="https://blog.com/case-study" />
                    </div>
                </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <label className="text-sm font-medium mb-2 block dark:text-slate-200">Project Image</label>
                <CloudinaryUploader
                    buttonText={formData.image ? "Change Image" : "Upload Image"}
                    onSuccess={(res: any) => setFormData(p => ({ ...p, image: res.secure_url }))}
                    folder="projects"
                />
                {formData.image && (
                    <div className="mt-3 relative group w-full h-48 rounded-lg border overflow-hidden">
                        <Image
                            src={formData.image}
                            alt="Preview"
                            fill
                            sizes="(max-width: 768px) 100vw, 600px"
                            className="object-cover"
                        />
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

            <Button type="submit" disabled={isSubmitting} className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600">
                {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : project ? "Update Project" : "Create Project"}
            </Button>
        </form>
    );
};
