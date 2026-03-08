"use client";

import { useState } from "react";
import { FileText, Loader2, Plus, Trash2 } from "lucide-react";
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
import { AboutForm } from "./about-form";
import { AboutCard } from "./about-card";
import { useAbout, useCreateAbout, useUpdateAbout, useDeleteAbout } from "@/app/hooks/useAbout";
import { About } from "@/services/about";

export function AboutManager() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const { data: aboutContent, isLoading, refetch } = useAbout();
    const createAbout = useCreateAbout();
    const updateAbout = useUpdateAbout();
    const deleteAboutMutation = useDeleteAbout();

    const handleAboutSubmit = (data: Omit<About, "_id">) => {
        const action = aboutContent ? updateAbout : createAbout;
        action.mutate(data, {
            onSuccess: () => {
                setIsDialogOpen(false);
                refetch();
            },
        });
    };

    const handleDelete = () => {
        deleteAboutMutation.mutate(undefined, {
            onSuccess: () => {
                setIsDeleteDialogOpen(false);
                refetch();
            },
        });
    };

    if (isLoading) {
        return <Skeleton className="h-64 w-full rounded-2xl" />;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white/50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700 backdrop-blur-sm">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-100">About Me</h2>
                    <p className="text-sm text-gray-500 dark:text-slate-400">Your personal story and introduction</p>
                </div>
                {!aboutContent && (
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md transition-all duration-300">
                                <Plus className="mr-2 h-4 w-4" /> Create About
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[95vw] max-w-2xl p-0 flex flex-col max-h-[90vh]">
                            <div className="flex-none px-6 pt-6 pb-4 border-b border-border">
                                <DialogHeader>
                                    <DialogTitle>Create About Section</DialogTitle>
                                </DialogHeader>
                            </div>
                            <div className="flex-1 overflow-y-auto min-h-0 px-6 py-5">
                                <AboutForm
                                    onSubmit={handleAboutSubmit}
                                    isSubmitting={createAbout.isPending}
                                />
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {aboutContent ? (
                <AboutCard
                    about={aboutContent}
                    onEdit={() => setIsDialogOpen(true)}
                    onDelete={() => setIsDeleteDialogOpen(true)}
                />
            ) : (
                <div className="text-center py-20 bg-gray-50/50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-700">
                    <FileText className="mx-auto h-12 w-12 text-gray-300 dark:text-slate-600 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">No about section</h3>
                    <p className="text-gray-500 dark:text-slate-400 mb-6">Write a compelling introduction about yourself.</p>
                    <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600 text-white hover:bg-blue-700 shadow-md transition-all duration-300">
                        <Plus className="mr-2 h-4 w-4" /> Create About
                    </Button>
                </div>
            )}

            {/* Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="w-[95vw] max-w-2xl p-0 flex flex-col max-h-[90vh]">
                    <div className="flex-none px-6 pt-6 pb-4 border-b border-border">
                        <DialogHeader>
                            <DialogTitle>Edit About Section</DialogTitle>
                        </DialogHeader>
                    </div>
                    <div className="flex-1 overflow-y-auto min-h-0 px-6 py-5">
                        <AboutForm
                            about={aboutContent || undefined}
                            onSubmit={handleAboutSubmit}
                            isSubmitting={updateAbout.isPending || createAbout.isPending}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Alert */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent className="w-[95vw] max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete your about section.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                        <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleteAboutMutation.isPending}
                            className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
                        >
                            {deleteAboutMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
