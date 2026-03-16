"use client";

import { useState, useEffect } from "react";
import { Plus, User, Loader2 } from "lucide-react";
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
import { ProfileForm } from "./profile-form";
import { ProfileCard } from "./profile-card";
import { useProfiles, useCreateProfile, useUpdateProfile, useDeleteProfile } from "@/app/hooks/useProfiles";
import { Profile } from "@/services/profile";

export function ProfileManager() {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
    const [avatarUrl, setAvatarUrl] = useState("");
    const [resumeUrl, setResumeUrl] = useState("");
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const { data: profiles = [], isLoading, refetch } = useProfiles();
    const createProfile = useCreateProfile();
    const updateProfile = useUpdateProfile();
    const deleteProfile = useDeleteProfile();

    const resetForm = () => {
        setSelectedProfile(null);
        setAvatarUrl("");
        setResumeUrl("");
    };

    const handleCreateSubmit = (data: Omit<Profile, "_id">) => {
        createProfile.mutate(
            { ...data, avatarUrl, resumeUrl },
            {
                onSuccess: () => {
                    setIsCreateDialogOpen(false);
                    resetForm();
                    refetch();
                },
            }
        );
    };

    const handleEditSubmit = (data: Omit<Profile, "_id">) => {
        if (!selectedProfile) return;
        updateProfile.mutate(
            {
                ...data,
                _id: selectedProfile._id,
                avatarUrl: avatarUrl || data.avatarUrl,
                resumeUrl: resumeUrl || data.resumeUrl,
            },
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
        if (!selectedProfile) return;
        deleteProfile.mutate(selectedProfile._id, {
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
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-slate-100">Profiles</h2>
                    <p className="text-sm text-gray-500 dark:text-slate-400">Manage your public bio and branding</p>
                </div>
                {profiles.length === 0 && isMounted && (
                    <Dialog open={isCreateDialogOpen} onOpenChange={(open) => { setIsCreateDialogOpen(open); if (!open) resetForm(); }}>
                        <DialogTrigger asChild>
                            <Button className="w-full sm:w-auto font-bold transition-opacity hover:opacity-85 shadow-md" style={{ background: "#FFB902", color: "#04061a" }}>
                                <Plus className="mr-2 h-4 w-4" /> Create Profile
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[95vw] max-w-2xl p-0 flex flex-col max-h-[90vh]">
                            <div className="flex-none px-6 pt-6 pb-4 border-b border-border">
                                <DialogHeader>
                                    <DialogTitle>Create New Profile</DialogTitle>
                                </DialogHeader>
                            </div>
                            <div className="flex-1 overflow-y-auto min-h-0 px-6 py-5">
                                <ProfileForm
                                    onSubmit={handleCreateSubmit}
                                    isSubmitting={createProfile.isPending}
                                    onAvatarUpload={setAvatarUrl}
                                    avatarUrl={avatarUrl}
                                    onResumeUpload={setResumeUrl}
                                    resumeUrl={resumeUrl}
                                />
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {profiles.length > 0 ? (
                <div className={`grid gap-4 sm:gap-6 ${profiles.length === 1 ? "grid-cols-1 max-w-sm sm:max-w-md" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
                    {profiles.map((profile) => (
                        <ProfileCard
                            key={profile._id}
                            profile={profile}
                            onEdit={(p) => {
                                setSelectedProfile(p);
                                setAvatarUrl(p.avatarUrl || "");
                                setResumeUrl(p.resumeUrl || "");
                                setIsEditDialogOpen(true);
                            }}
                            onDelete={(p) => {
                                setSelectedProfile(p);
                                setIsDeleteDialogOpen(true);
                            }}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 sm:py-20 bg-gray-50/50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-700">
                    <User className="mx-auto h-12 w-12 text-gray-300 dark:text-slate-600 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">No profiles found</h3>
                    <p className="text-gray-500 dark:text-slate-400 mb-6">Create your first professional identity.</p>
                    <Button onClick={() => setIsCreateDialogOpen(true)} className="font-bold transition-opacity hover:opacity-85 shadow-md" style={{ background: "#FFB902", color: "#04061a" }}>
                        <Plus className="mr-2 h-4 w-4" /> Create Profile
                    </Button>
                </div>
            )}

            {/* Edit Dialog */}
            {isMounted && (
                <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) resetForm(); }}>
                    <DialogContent className="w-[95vw] max-w-2xl p-0 flex flex-col max-h-[90vh]">
                        <div className="flex-none px-6 pt-6 pb-4 border-b border-border">
                            <DialogHeader>
                                <DialogTitle>Edit Profile</DialogTitle>
                            </DialogHeader>
                        </div>
                        <div className="flex-1 overflow-y-auto min-h-0 px-6 py-5">
                            <ProfileForm
                                profile={selectedProfile || undefined}
                                onSubmit={handleEditSubmit}
                                isSubmitting={updateProfile.isPending}
                                onAvatarUpload={setAvatarUrl}
                                avatarUrl={avatarUrl}
                                onResumeUpload={setResumeUrl}
                                resumeUrl={resumeUrl}
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* Delete Alert */}
            {isMounted && (
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => { setIsDeleteDialogOpen(open); if (!open) resetForm(); }}>
                    <AlertDialogContent className="w-[95vw] max-w-md">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete the profile "{selectedProfile?.name}".
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                            <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                disabled={deleteProfile.isPending}
                                className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
                            >
                                {deleteProfile.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
    );
}
