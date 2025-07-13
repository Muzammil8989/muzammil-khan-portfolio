"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
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
import { ProfileForm } from "@/components/profile-form";
import {
  useProfiles,
  useCreateProfile,
  useUpdateProfile,
  useDeleteProfile,
} from "@/app/hooks/useProfiles";
import { Profile } from "@/services/profile";
import { toast } from "sonner";
import { Loader2, User, Plus } from "lucide-react";
import SignOutButton from "@/components/signout-button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileCard } from "@/components/profile-card";

export default function DashboardManager() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [avatarUrl, setAvatarUrl] = useState("");

  const { data: profiles = [], isLoading, isError, refetch } = useProfiles();

  const createProfile = useCreateProfile();
  const updateProfile = useUpdateProfile();
  const deleteProfile = useDeleteProfile();

  const resetFormStates = () => {
    setAvatarUrl("");
    setSelectedProfile(null);
  };

  const handleCreateSubmit = (data: Omit<Profile, "_id">) => {
    createProfile.mutate(
      { ...data, avatarUrl },
      {
        onSuccess: () => {
          toast.success("Profile created successfully");
          setIsCreateDialogOpen(false);
          resetFormStates();
          refetch();
        },
        onError: (error) => {
          toast.error(error.message || "Failed to create profile");
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
      },
      {
        onSuccess: () => {
          toast.success("Profile updated successfully");
          setIsEditDialogOpen(false);
          resetFormStates();
          refetch();
        },
        onError: (error) => {
          toast.error(error.message || "Failed to update profile");
        },
      }
    );
  };

  const handleDelete = () => {
    if (!selectedProfile) return;

    deleteProfile.mutate(selectedProfile._id, {
      onSuccess: () => {
        toast.success("Profile deleted successfully");
        setIsDeleteDialogOpen(false);
        resetFormStates();
        refetch();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete profile");
      },
    });
  };

  const handleEditClick = (profile: Profile) => {
    setSelectedProfile(profile);
    setAvatarUrl(profile.avatarUrl || "");
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (profile: Profile) => {
    setSelectedProfile(profile);
    setIsDeleteDialogOpen(true);
  };

  if (isError) {
    return (
      <div className="p-4 text-red-500">
        Error loading profiles. Please try again.
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="container mx-auto  px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Profile Dashboard
          </h1>
          <div className="grid gap-2  grid-cols-2  md:w-auto">
            {/* Moved Create Profile button here to avoid collision with tabs on mobile */}
            {profiles.length === 0 && (
              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={(open) => {
                  setIsCreateDialogOpen(open);
                  if (!open) resetFormStates();
                }}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full md:w-auto"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">
                      Create New Profile
                    </DialogTitle>
                  </DialogHeader>
                  <ProfileForm
                    onSubmit={handleCreateSubmit}
                    isSubmitting={createProfile.isPending}
                    onAvatarUpload={setAvatarUrl}
                    avatarUrl={avatarUrl}
                  />
                </DialogContent>
              </Dialog>
            )}
            <SignOutButton />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
          <Tabs defaultValue="profiles">
            <div className="mb-6">
              <TabsList className="grid w-full grid-cols-2 max-w-xs">
                <TabsTrigger value="profiles">Profiles</TabsTrigger>
                <TabsTrigger value="my-profile">My Profile</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="profiles">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-64 rounded-lg" />
                  ))}
                </div>
              ) : profiles.length > 0 ? (
                <div
                  className={`grid gap-4 md:gap-6 ${
                    profiles.length === 1
                      ? "grid-cols-1 max-w-md mx-auto"
                      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                  }`}
                >
                  {profiles.map((profile) => (
                    <ProfileCard
                      key={profile._id}
                      profile={profile}
                      onEdit={handleEditClick}
                      onDelete={handleDeleteClick}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <User className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">
                    No profiles
                  </h3>
                  <p className="mt-1 text-gray-500">
                    Get started by creating a new profile.
                  </p>
                </div>
              )}

              <Dialog
                open={isEditDialogOpen}
                onOpenChange={(open) => {
                  setIsEditDialogOpen(open);
                  if (!open) resetFormStates();
                }}
              >
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">
                      Edit Profile
                    </DialogTitle>
                  </DialogHeader>
                  <ProfileForm
                    profile={selectedProfile || undefined}
                    onSubmit={handleEditSubmit}
                    isSubmitting={updateProfile.isPending}
                    onAvatarUpload={setAvatarUrl}
                    avatarUrl={avatarUrl}
                  />
                </DialogContent>
              </Dialog>

              <AlertDialog
                open={isDeleteDialogOpen}
                onOpenChange={(open) => {
                  setIsDeleteDialogOpen(open);
                  if (!open) resetFormStates();
                }}
              >
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-lg font-semibold">
                      Confirm Deletion
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the profile "
                      {selectedProfile?.name}". This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-gray-300 hover:bg-gray-50">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={deleteProfile.isPending}
                      className="bg-red-600 hover:bg-red-700 dark:text-white"
                    >
                      {deleteProfile.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        "Delete"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TabsContent>

            <TabsContent value="my-profile">
              <div className="p-4 md:p-6 border border-gray-200 rounded-lg bg-gray-50">
                <h2 className="text-lg md:text-xl font-bold mb-4 text-gray-800">
                  My Profile
                </h2>
                <p className="text-gray-600">
                  Manage your personal profile settings and preferences here.
                  You can update your information, change your password, and
                  adjust your notification settings.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
