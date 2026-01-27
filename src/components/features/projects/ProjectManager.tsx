"use client";

import { useState } from "react";
import { Plus, Layout, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ProjectForm } from "./project-form";
import { ProjectCard } from "./project-card";
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from "@/app/hooks/useProjects";
import { Project } from "@/services/project";

export function ProjectManager() {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<any>(null);

    const { data: projects = [], isLoading, refetch } = useProjects();
    const createProject = useCreateProject();
    const updateProject = useUpdateProject();
    const deleteProject = useDeleteProject();

    const handleCreateSubmit = (data: Omit<Project, "_id">) => {
        createProject.mutate(data, {
            onSuccess: () => {
                setIsCreateDialogOpen(false);
                refetch();
            },
        });
    };

    const handleEditSubmit = (data: Omit<Project, "_id">) => {
        if (!selectedProject) return;
        updateProject.mutate(
            { ...data, _id: selectedProject._id },
            {
                onSuccess: () => {
                    setIsEditDialogOpen(false);
                    setSelectedProject(null);
                    refetch();
                },
            }
        );
    };

    const handleDelete = () => {
        if (!selectedProject) return;
        deleteProject.mutate(selectedProject._id, {
            onSuccess: () => {
                setIsDeleteDialogOpen(false);
                setSelectedProject(null);
                refetch();
            },
        });
    };

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-80 rounded-2xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white/50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700 backdrop-blur-sm">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-100">Portfolio Projects</h2>
                    <p className="text-sm text-gray-500 dark:text-slate-400">Showcase your best work and side projects</p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md transition-all duration-300">
                            <Plus className="mr-2 h-4 w-4" /> Create Project
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[700px]">
                        <DialogHeader>
                            <DialogTitle>Add New Project</DialogTitle>
                        </DialogHeader>
                        <ProjectForm
                            onSubmit={handleCreateSubmit}
                            isSubmitting={createProject.isPending}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            {projects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <ProjectCard
                            key={project._id}
                            project={project}
                            onEdit={(p) => {
                                setSelectedProject(p);
                                setIsEditDialogOpen(true);
                            }}
                            onDelete={(p) => {
                                setSelectedProject(p);
                                setIsDeleteDialogOpen(true);
                            }}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50/50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-700">
                    <Layout className="mx-auto h-12 w-12 text-gray-300 dark:text-slate-600 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">No projects yet</h3>
                    <p className="text-gray-500 dark:text-slate-400 mb-6">Start building your portfolio by adding a project.</p>
                    <Button onClick={() => setIsCreateDialogOpen(true)} variant="outline">
                        <Plus className="mr-2 h-4 w-4" /> Add First Project
                    </Button>
                </div>
            )}

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[700px]">
                    <DialogHeader>
                        <DialogTitle>Edit Project</DialogTitle>
                    </DialogHeader>
                    <ProjectForm
                        project={selectedProject || undefined}
                        onSubmit={handleEditSubmit}
                        isSubmitting={updateProject.isPending}
                    />
                </DialogContent>
            </Dialog>

            {/* Delete Alert */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete "{selectedProject?.title}". This action 8annot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleteProject.isPending}
                            className="bg-red-600 hover:bg-red-700 font-semibold"
                        >
                            {deleteProject.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
