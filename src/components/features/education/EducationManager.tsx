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
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white/50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700 backdrop-blur-sm">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-100">Education</h2>
                    <p className="text-sm text-gray-500 dark:text-slate-400">Your academic background</p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={(open) => { setIsCreateDialogOpen(open); if (!open) resetForm(); }}>
                    <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md transition-all duration-300">
                            <Plus className="mr-2 h-4 w-4" /> Add Education
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[700px]">
                        <DialogHeader>
                            <DialogTitle>Add Education</DialogTitle>
                        </DialogHeader>
                        <EducationForm
                            onSubmit={handleCreateSubmit}
                            isSubmitting={createEducation.isPending}
                            onLogoUpload={setLogoUrl}
                            logoUrl={logoUrl}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            {educations.length > 0 ? (
                <div className={`grid gap-6 ${educations.length === 1 ? "grid-cols-1 max-w-md" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
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
                <div className="text-center py-20 bg-gray-50/50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-700">
                    <GraduationCap className="mx-auto h-12 w-12 text-gray-300 dark:text-slate-600 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">No education entries</h3>
                    <p className="text-gray-500 dark:text-slate-400 mb-6">Display your academic achievements.</p>
                    <Button onClick={() => setIsCreateDialogOpen(true)} variant="outline">
                        <Plus className="mr-2 h-4 w-4" /> Add Education
                    </Button>
                </div>
            )}

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) resetForm(); }}>
                <DialogContent className="sm:max-w-[700px]">
                    <DialogHeader>
                        <DialogTitle>Edit Education</DialogTitle>
                    </DialogHeader>
                    <EducationForm
                        education={selectedEducation || undefined}
                        onSubmit={handleEditSubmit}
                        isSubmitting={updateEducation.isPending}
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
                            This will permanently delete this education entry.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleteEducation.isPending}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {deleteEducation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
