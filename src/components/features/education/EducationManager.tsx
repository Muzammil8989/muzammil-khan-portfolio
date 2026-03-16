"use client";

import { useState } from "react";
import { Plus, GraduationCap, Loader2 } from "lucide-react";
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
import { EducationForm } from "./education-form";
import { EducationCard } from "./education-card";
import {
    useEducations,
    useCreateEducation,
    useUpdateEducation,
    useDeleteEducation,
} from "@/app/hooks/useEducation";
import { Education } from "@/services/education";

export function EducationManager() {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedEducation, setSelectedEducation] = useState<any>(null);
    const [logoUrl, setLogoUrl] = useState("");

    const { data: educations = [], isLoading, refetch } = useEducations();
    const createEducation = useCreateEducation();
    const updateEducation = useUpdateEducation();
    const deleteEducation = useDeleteEducation();

    const resetForm = () => {
        setSelectedEducation(null);
        setLogoUrl("");
    };

    const handleCreateSubmit = (data: Omit<Education, "_id">) => {
        createEducation.mutate(
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

    const handleEditSubmit = (data: Omit<Education, "_id">) => {
        if (!selectedEducation) return;
        updateEducation.mutate(
            { id: selectedEducation._id, data: { ...data, logoUrl: logoUrl || data.logoUrl } },
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
        if (!selectedEducation) return;
        deleteEducation.mutate(selectedEducation._id, {
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
        <div className="space-y-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-white/50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700 backdrop-blur-sm">
                <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-slate-100">Education</h2>
                    <p className="text-sm text-gray-500 dark:text-slate-400">Your academic background</p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={(open) => { setIsCreateDialogOpen(open); if (!open) resetForm(); }}>
                    <DialogTrigger asChild>
                        <Button className="w-full sm:w-auto font-bold transition-opacity hover:opacity-85 shadow-md" style={{ background: "#FFB902", color: "#04061a" }}>
                            <Plus className="mr-2 h-4 w-4" /> Add Education
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] max-w-xl p-0 flex flex-col max-h-[90vh]">
                        <div className="flex-none px-6 pt-6 pb-4 border-b border-border">
                            <DialogHeader>
                                <DialogTitle>Add Education</DialogTitle>
                            </DialogHeader>
                        </div>
                        <div className="flex-1 overflow-y-auto min-h-0 px-6 py-5">
                            <EducationForm
                                onSubmit={handleCreateSubmit}
                                isSubmitting={createEducation.isPending}
                                onLogoUpload={setLogoUrl}
                                logoUrl={logoUrl}
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {educations.length > 0 ? (
                <div className={`grid gap-4 sm:gap-6 ${educations.length === 1 ? "grid-cols-1 max-w-sm sm:max-w-md mx-auto w-full" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
                    {educations.map((item) => (
                        <EducationCard
                            key={item._id}
                            education={item}
                            onEdit={(e) => {
                                setSelectedEducation(e);
                                setLogoUrl(e.logoUrl || "");
                                setIsEditDialogOpen(true);
                            }}
                            onDelete={(e) => {
                                setSelectedEducation(e);
                                setIsDeleteDialogOpen(true);
                            }}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 sm:py-20 bg-gray-50/50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-700">
                    <GraduationCap className="mx-auto h-12 w-12 text-gray-300 dark:text-slate-600 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">No education entries</h3>
                    <p className="text-gray-500 dark:text-slate-400 mb-6">Display your academic achievements.</p>
                    <Button onClick={() => setIsCreateDialogOpen(true)} className="font-bold transition-opacity hover:opacity-85 shadow-md" style={{ background: "#FFB902", color: "#04061a" }}>
                        <Plus className="mr-2 h-4 w-4" /> Add Education
                    </Button>
                </div>
            )}

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) resetForm(); }}>
                <DialogContent className="w-[95vw] max-w-xl p-0 flex flex-col max-h-[90vh]">
                    <div className="flex-none px-6 pt-6 pb-4 border-b border-border">
                        <DialogHeader>
                            <DialogTitle>Edit Education</DialogTitle>
                        </DialogHeader>
                    </div>
                    <div className="flex-1 overflow-y-auto min-h-0 px-6 py-5">
                        <EducationForm
                            education={selectedEducation || undefined}
                            onSubmit={handleEditSubmit}
                            isSubmitting={updateEducation.isPending}
                            onLogoUpload={setLogoUrl}
                            logoUrl={logoUrl}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Alert */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => { setIsDeleteDialogOpen(open); if (!open) resetForm(); }}>
                <AlertDialogContent className="w-[95vw] max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this education entry.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                        <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleteEducation.isPending}
                            className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
                        >
                            {deleteEducation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
