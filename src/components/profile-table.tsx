"use client";

import { Profile } from "@/services/profile";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface ProfileTableProps {
  profiles: Profile[];
  isLoading: boolean;
  onEdit: (profile: Profile) => void;
  onDelete: (profile: Profile) => void;
}

export const ProfileTable = ({
  profiles,
  isLoading,
  onEdit,
  onDelete,
}: ProfileTableProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Avatar</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Initials</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {profiles.map((profile) => (
          <TableRow key={profile._id}>
            <TableCell>
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  {profile.initials}
                </div>
              )}
            </TableCell>
            <TableCell>{profile.name}</TableCell>
            <TableCell>{profile.description}</TableCell>
            <TableCell>{profile.initials}</TableCell>
            <TableCell className="space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(profile)}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(profile)}
              >
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
