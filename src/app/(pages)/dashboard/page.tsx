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
import { ProfileTable } from "@/components/profile-table";
import { ProfileForm } from "@/components/profile-form";
import {
  useProfiles,
  useCreateProfile,
  useUpdateProfile,
  useDeleteProfile,
} from "@/app/hooks/useProfiles";
import { Profile } from "@/services/profile";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import SignOutButton from "@/components/signout-button";

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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto ">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <SignOutButton />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <Tabs defaultValue="profiles">
            <div className="flex justify-between items-center mb-6">
              <TabsList className="grid w-full max-w-xs grid-cols-2">
                <TabsTrigger value="profiles">Profiles</TabsTrigger>
                <TabsTrigger value="my-profile">My Profile</TabsTrigger>
              </TabsList>

              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={(open) => {
                  setIsCreateDialogOpen(open);
                  if (!open) resetFormStates();
                }}
              >
                <DialogTrigger asChild>
                  <Button variant="default" size="sm">
                    Create Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-gray-800">
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
            </div>

            <TabsContent value="profiles">
              <div className="overflow-x-auto">
                <ProfileTable
                  profiles={profiles}
                  isLoading={isLoading}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                />
              </div>

              <Dialog
                open={isEditDialogOpen}
                onOpenChange={(open) => {
                  setIsEditDialogOpen(open);
                  if (!open) resetFormStates();
                }}
              >
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-gray-800">
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
                    <AlertDialogTitle className="text-lg font-semibold text-gray-800">
                      Confirm Deletion
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-600">
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
                      className="bg-red-600 hover:bg-red-700"
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
              <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
                <h2 className="text-xl font-bold mb-4 text-gray-800">
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
