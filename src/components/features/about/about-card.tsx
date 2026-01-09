"use client";
import { Button } from "@/components/ui/button";
import { About } from "@/services/about";
import { Edit, Trash2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

interface AboutCardProps {
  about: About;
  onEdit?: (about: About) => void;
  onDelete?: (about: About) => void;
  showActions?: boolean;
}

export const AboutCard = ({
  about,
  onEdit,
  onDelete,
  showActions = true,
}: AboutCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow h-full flex flex-col">
      <CardHeader className="flex flex-col items-center pb-2">
        <h3 className="text-lg md:text-xl font-semibold text-center">
          About Us
        </h3>
      </CardHeader>
      <CardContent className="text-center text-gray-600 dark:text-slate-300 flex-grow">
        <p className="line-clamp-3">{about.message}</p>
      </CardContent>
      {showActions && onEdit && onDelete && (
        <CardFooter className="flex justify-center gap-2 pt-2 pb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(about)}
            className="flex-1"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(about)}
            className="flex-1"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};