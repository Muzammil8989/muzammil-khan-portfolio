"use client";
import { Button } from "@/components/ui/button";
import { Profile } from "@/services/profile";
import { Edit, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export const ProfileCard = ({
  profile,
  onEdit,
  onDelete,
}: {
  profile: Profile;
  onEdit: (profile: Profile) => void;
  onDelete: (profile: Profile) => void;
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow h-full flex flex-col">
      <CardHeader className="flex flex-col items-center pb-2">
        <Avatar className="w-20 h-20 md:w-24 md:h-24 mb-4">
          <AvatarImage src={profile.avatarUrl} />
          <AvatarFallback className="text-2xl">
            {profile.initials}
          </AvatarFallback>
        </Avatar>
        <h3 className="text-lg md:text-xl font-semibold text-center">
          {profile.name}
        </h3>
      </CardHeader>
      <CardContent className="text-center text-gray-600 dark:text-slate-300 flex-grow">
        <p className="line-clamp-3">{profile.description}</p>
      </CardContent>
      <CardFooter className="flex justify-center gap-2 pt-2 pb-4">
        <Button
          size="sm"
          onClick={() => onEdit(profile)}
          className="flex-1 bg-blue-600 text-white hover:bg-blue-700 shadow-md transition-all duration-300"
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(profile)}
          className="flex-1"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
};
