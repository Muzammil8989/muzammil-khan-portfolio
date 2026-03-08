"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { BlogForm } from "./blog-form";
import { LinkedInPostDialog } from "./LinkedInPostDialog";
import { useBlogManager } from "./blog-manager-context";

export function BlogManagerDialogs() {
  const {
    state: {
      selectedBlog,
      linkedInBlog,
      unlinkBlog,
      isEditOpen,
      isDeleteOpen,
      isUnlinkOpen,
      updateBlog,
      deleteBlog,
      deleteLinkedInPost,
    },
    actions: {
      setIsEditOpen,
      setIsDeleteOpen,
      setIsUnlinkOpen,
      setLinkedInBlog,
      handleEditSubmit,
      handleDelete,
      handleUnlinkPost,
    },
  } = useBlogManager();

  return (
    <>
      {/* Edit dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="w-[95vw] max-w-3xl p-0 flex flex-col max-h-[90vh]">
          <div className="flex-none px-6 pt-6 pb-4 border-b border-border">
            <DialogHeader>
              <DialogTitle>Edit Blog Post</DialogTitle>
              <DialogDescription>Make changes to your blog post</DialogDescription>
            </DialogHeader>
          </div>
          <div className="flex-1 overflow-y-auto min-h-0 px-6 py-5">
            {selectedBlog && (
              <BlogForm
                blog={selectedBlog}
                onSubmit={handleEditSubmit}
                isSubmitting={updateBlog.isPending}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete alert */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="w-[95vw] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete blog post?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-semibold text-foreground">
                "{selectedBlog?.title}"
              </span>
              . This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteBlog.isPending}
              className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
            >
              {deleteBlog.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unlink LinkedIn alert */}
      <AlertDialog open={isUnlinkOpen} onOpenChange={setIsUnlinkOpen}>
        <AlertDialogContent className="w-[95vw] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete LinkedIn post?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the LinkedIn post for{" "}
              <span className="font-semibold text-foreground">
                "{unlinkBlog?.title}"
              </span>
              . The blog will remain on your portfolio but the post will be
              removed from LinkedIn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnlinkPost}
              disabled={deleteLinkedInPost.isPending}
              className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
            >
              {deleteLinkedInPost.isPending ? "Deleting…" : "Delete from LinkedIn"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* LinkedIn post dialog */}
      {linkedInBlog && (
        <LinkedInPostDialog
          blog={linkedInBlog}
          open={!!linkedInBlog}
          onOpenChange={(open) => {
            if (!open) setLinkedInBlog(null);
          }}
        />
      )}
    </>
  );
}
