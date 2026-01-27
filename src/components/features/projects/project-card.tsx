"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Project } from "@/services/project";
import { Edit, Trash2, Code } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export const ProjectCard = ({
    project,
    onEdit,
    onDelete,
}: {
    project: Project;
    onEdit: (project: Project) => void;
    onDelete: (project: Project) => void;
}) => {
    return (
        <Card className="hover:shadow-xl transition-all duration-300 h-full flex flex-col group border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Visual Preview */}
            <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 overflow-hidden">
                {project.image ? (
                    <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-300 dark:text-slate-600">
                        <Code className="w-16 h-16 opacity-30" />
                    </div>
                )}
                <div className="absolute top-3 left-3 flex gap-1">
                    {project.active && <Badge className="bg-emerald-500 hover:bg-emerald-600 border-none">Active</Badge>}
                </div>
            </div>

            <CardHeader className="p-5 pb-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors uppercase tracking-tight">
                    {project.title}
                </h3>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                    {project.dates}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                    {project.technologies.slice(0, 4).map((tech) => (
                        <span key={tech} className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold border border-slate-200 dark:border-slate-700 uppercase">
                            {tech}
                        </span>
                    ))}
                    {project.technologies.length > 4 && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 self-center">+{project.technologies.length - 4} more</span>
                    )}
                </div>
            </CardHeader>

            <CardContent className="p-5 pt-2 flex-grow">
                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                    {project.description}
                </p>
            </CardContent>

            <CardFooter className="p-5 pt-0 flex gap-3">
                <Button
                    size="sm"
                    onClick={() => onEdit(project)}
                    className="flex-1 bg-blue-600 text-white hover:bg-blue-700 shadow-md transition-all duration-300 font-semibold"
                >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                </Button>
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(project)}
                    className="flex-1"
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                </Button>
            </CardFooter>
        </Card>
    );
};
