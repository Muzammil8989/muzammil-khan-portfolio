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

    const { data: about, isLoading, refetch } = useAbout();
    const createAbout = useCreateAbout();
    const updateAbout = useUpdateAbout();
    const deleteAboutMutation = useDeleteAbout();

    const handleAboutSubmit = (data: Omit<About, "_id">) => {
        const action = about ? updateAbout : createAbout;
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
                {!about && (
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-md">
                                <Plus className="mr-2 h-4 w-4" /> Create About
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle>Create About Section</DialogTitle>
                            </DialogHeader>
                            <AboutForm
                                onSubmit={handleAboutSubmit}
                                isSubmitting={createAbout.isPending}
                            />
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {about ? (
                <AboutCard
                    about={about}
                    onEdit={() => setIsDialogOpen(true)}
                    onDelete={() => setIsDeleteDialogOpen(true)}
                />
            ) : (
                <div className="text-center py-20 bg-gray-50/50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-700">
                    <FileText className="mx-auto h-12 w-12 text-gray-300 dark:text-slate-600 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">No about section</h3>
                    <p className="text-gray-500 dark:text-slate-400 mb-6">Write a compelling introduction about yourself.</p>
                    <Button onClick={() => setIsDialogOpen(true)} variant="outline">
                        <Plus className="mr-2 h-4 w-4" /> Create About
                    </Button>
                </div>
            )}

            {/* Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Edit About Section</DialogTitle>
                    </DialogHeader>
                    <AboutForm
                        about={about || undefined}
                        onSubmit={handleAboutSubmit}
                        isSubmitting={updateAbout.isPending || createAbout.isPending}
                    />
                </DialogContent>
            </Dialog>

            {/* Delete Alert */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete your about section.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleteAboutMutation.isPending}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {deleteAboutMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
