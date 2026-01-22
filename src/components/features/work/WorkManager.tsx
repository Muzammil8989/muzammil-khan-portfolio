"use client";

import { useState } from "react";
import { Plus, Briefcase, Loader2 } from "lucide-react";
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
import { WorkExperienceForm } from "./work-experience-form";
import { WorkExperienceCard } from "./work-experience-card";
import {
    useWorkExperiences,
    useCreateWorkExperience,
    useUpdateWorkExperience,
    useDeleteWorkExperience,
} from "@/app/hooks/useWorkExperiences";
import { WorkExperience } from "@/services/work";

export function WorkManager() {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedWork, setSelectedWork] = useState<any>(null);
    const [logoUrl, setLogoUrl] = useState("");

    const { data: workExperiences = [], isLoading, refetch } = useWorkExperiences();
    const createWork = useCreateWorkExperience();
    const updateWork = useUpdateWorkExperience();
    const deleteWork = useDeleteWorkExperience();

    const resetForm = () => {
        setSelectedWork(null);
        setLogoUrl("");
    };

    const handleCreateSubmit = (data: Omit<WorkExperience, "_id">) => {
        createWork.mutate(
            { ...data, logoUrl },
            {
                onSuccess: () => {
                    setIsCreateDialogOpen(false);
                    resetForm();
                    refetch();
                },
            }
        );
    };

    const handleEditSubmit = (data: Omit<WorkExperience, "_id">) => {
        if (!selectedWork) return;
        updateWork.mutate(
            { ...selectedWork, ...data, logoUrl: logoUrl || data.logoUrl },
            {
                onSuccess: () => {
                    setIsEditDialogOpen(false);
                    resetForm();
                    refetch();
                },
            }
        );
    };

    const handleDelete = () => {
        if (!selectedWork) return;
        deleteWork.mutate(selectedWork._id, {
            onSuccess: () => {
                setIsDeleteDialogOpen(false);
                resetForm();
                refetch();
            },
        });
    };

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-64 rounded-lg" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white/50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700 backdrop-blur-sm">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-100">Work Experience</h2>
                    <p className="text-sm text-gray-500 dark:text-slate-400">Highlight your career milestones</p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={(open) => { setIsCreateDialogOpen(open); if (!open) resetForm(); }}>
                    <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md transition-all duration-300">
                            <Plus className="mr-2 h-4 w-4" /> Add Experience
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[700px]">
                        <DialogHeader>
                            <DialogTitle>Create Work Experience</DialogTitle>
                        </DialogHeader>
                        <WorkExperienceForm
                            onSubmit={handleCreateSubmit}
                            isSubmitting={createWork.isPending}
                            onLogoUpload={setLogoUrl}
                            logoUrl={logoUrl}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            {workExperiences.length > 0 ? (
                <div className={`grid gap-6 ${workExperiences.length === 1 ? "grid-cols-1 max-w-md" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
                    {workExperiences.map((work) => (
                        <WorkExperienceCard
                            key={work._id}
                            work={work}
                            onEdit={(w) => {
                                setSelectedWork(w);
                                setLogoUrl(w.logoUrl || "");
                                setIsEditDialogOpen(true);
                            }}
                            onDelete={(w) => {
                                setSelectedWork(w);
                                setIsDeleteDialogOpen(true);
                            }}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50/50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-700">
                    <Briefcase className="mx-auto h-12 w-12 text-gray-300 dark:text-slate-600 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">No work experiences</h3>
                    <p className="text-gray-500 dark:text-slate-400 mb-6">Start building your professional timeline.</p>
                    <Button onClick={() => setIsCreateDialogOpen(true)} variant="outline">
                        <Plus className="mr-2 h-4 w-4" /> Add Experience
                    </Button>
                </div>
            )}

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) resetForm(); }}>
                <DialogContent className="sm:max-w-[700px]">
                    <DialogHeader>
                        <DialogTitle>Edit Experience</DialogTitle>
                    </DialogHeader>
                    <WorkExperienceForm
                        work={selectedWork || undefined}
                        onSubmit={handleEditSubmit}
                        isSubmitting={updateWork.isPending}
                        onLogoUpload={setLogoUrl}
                        logoUrl={logoUrl}
                    />
                </DialogContent>
            </Dialog>

            {/* Delete Alert */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => { setIsDeleteDialogOpen(open); if (!open) resetForm(); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this experience.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleteWork.isPending}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {deleteWork.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
