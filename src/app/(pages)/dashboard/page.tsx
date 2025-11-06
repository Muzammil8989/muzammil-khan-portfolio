"use client";

import { useEffect, useState } from "react";
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
import { AboutForm } from "@/components/about-form";
import {
  useProfiles,
  useCreateProfile,
  useUpdateProfile,
  useDeleteProfile,
} from "@/app/hooks/useProfiles";
import { 
  useAbout, 
  useCreateAbout, 
  useUpdateAbout, 
  useDeleteAbout 
} from "@/app/hooks/useAbout";
import { Profile } from "@/services/profile";
import { About } from "@/services/about";
import { toast } from "sonner";
import { Loader2, User, Plus, FileText } from "lucide-react";
import SignOutButton from "@/components/signout-button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileCard } from "@/components/profile-card";
import { AboutCard } from "@/components/about-card";

export default function DashboardManager() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAboutDialogOpen, setIsAboutDialogOpen] = useState(false);
  const [isAboutDeleteDialogOpen, setIsAboutDeleteDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [selectedAbout, setSelectedAbout] = useState<About | null>(null);
  const [avatarUrl, setAvatarUrl] = useState("");

  const { data: profiles = [], isLoading, isError, refetch } = useProfiles();
  const {
    data: about,
    isLoading: isLoadingAbout,
    refetch: refetchAbout,
  } = useAbout();

  const createProfile = useCreateProfile();
  const updateProfile = useUpdateProfile();
  const deleteProfile = useDeleteProfile();
  const createAbout = useCreateAbout();
  const updateAbout = useUpdateAbout();
  const deleteAboutMutation = useDeleteAbout();

  // 🛠️ Scrollbar layout shift fix
  useEffect(() => {
    const anyDialogOpen =
      isCreateDialogOpen ||
      isEditDialogOpen ||
      isDeleteDialogOpen ||
      isAboutDialogOpen ||
      isAboutDeleteDialogOpen;
    
    if (anyDialogOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.paddingRight = "";
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.paddingRight = "";
      document.body.style.overflow = "";
    };
  }, [
    isCreateDialogOpen,
    isEditDialogOpen,
    isDeleteDialogOpen,
    isAboutDialogOpen,
    isAboutDeleteDialogOpen,
  ]);

  const resetFormStates = () => {
    setAvatarUrl("");
    setSelectedProfile(null);
    setSelectedAbout(null);
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

  // About Section Handlers
  const handleAboutSubmit = (data: Omit<About, "_id">) => {
    if (about) {
      // Update existing about
      updateAbout.mutate(data, {
        onSuccess: () => {
          toast.success("About section updated successfully");
          setIsAboutDialogOpen(false);
          resetFormStates();
          refetchAbout();
        },
        onError: (error: any) => {
          toast.error(error.message || "Failed to update About section");
        },
      });
    } else {
      // Create new about
      createAbout.mutate(data, {
        onSuccess: () => {
          toast.success("About section created successfully");
          setIsAboutDialogOpen(false);
          resetFormStates();
          refetchAbout();
        },
        onError: (error: any) => {
          toast.error(error.message || "Failed to create About section");
        },
      });
    }
  };

  const handleAboutDelete = () => {
    deleteAboutMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("About section deleted successfully");
        setIsAboutDeleteDialogOpen(false);
        resetFormStates();
        refetchAbout();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete About section");
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

  const handleAboutEditClick = () => {
    setSelectedAbout(about || null);
    setIsAboutDialogOpen(true);
  };

  const handleAboutDeleteClick = () => {
    setSelectedAbout(about || null);
    setIsAboutDeleteDialogOpen(true);
  };

  if (isError) {
    return (
      <div className="p-4 text-red-500">
        Error loading profiles. Please try again.
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-12 sm:py-20">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Dashboard Manager
          </h1>
          <div className="flex flex-col sm:flex-row gap-2 md:w-auto">
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
                    className="w-full sm:w-auto"
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
              <TabsList className="grid w-full grid-cols-3 max-w-md">
                <TabsTrigger value="profiles">Profiles</TabsTrigger>
                <TabsTrigger value="about">About</TabsTrigger>
               
              </TabsList>
            </div>

            {/* Profiles Tab */}
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
                  <Button
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="mt-4"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Profile
                  </Button>
                </div>
              )}

              {/* Edit Profile Dialog */}
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

              {/* Delete Profile Alert Dialog */}
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
                      className="bg-red-600 hover:bg-red-700 text-white"
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

            {/* About Tab */}
            <TabsContent value="about">
              <div className="space-y-6">
                {/* About Management Section */}
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    About Section
                  </h2>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleAboutEditClick}
                      variant="default"
                      size="sm"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      {about ? "Edit About" : "Create About"}
                    </Button>
                    {about && (
                      <Button
                        onClick={handleAboutDeleteClick}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        Delete About
                      </Button>
                    )}
                  </div>
                </div>

                {isLoadingAbout ? (
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ) : about ? (
                  <AboutCard about={about} />
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">
                      No About Section
                    </h3>
                    <p className="mt-1 text-gray-500">
                      Create an about section to tell your story.
                    </p>
                  </div>
                )}

                {/* About Edit/Create Dialog */}
                <Dialog
                  open={isAboutDialogOpen}
                  onOpenChange={(open) => {
                    setIsAboutDialogOpen(open);
                    if (!open) resetFormStates();
                  }}
                >
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-semibold">
                        {about ? "Edit About Section" : "Create About Section"}
                      </DialogTitle>
                    </DialogHeader>
                    <AboutForm
                      about={about || undefined}
                      onSubmit={handleAboutSubmit}
                      isSubmitting={about ? updateAbout.isPending : createAbout.isPending}
                    />
                  </DialogContent>
                </Dialog>

                {/* Delete About Alert Dialog */}
                <AlertDialog
                  open={isAboutDeleteDialogOpen}
                  onOpenChange={(open) => {
                    setIsAboutDeleteDialogOpen(open);
                    if (!open) resetFormStates();
                  }}
                >
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-lg font-semibold">
                        Confirm Deletion
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the About section. This
                        action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-gray-300 hover:bg-gray-50">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleAboutDelete}
                        disabled={deleteAboutMutation.isPending}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        {deleteAboutMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          "Delete About"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}