"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Edit, Trash2 } from "lucide-react";
import Image from "next/image";
import type { Education } from "@/services/education";

export const EducationCard = ({
  education,
  onEdit,
  onDelete,
}: {
  education: Education;
  onEdit: (education: Education) => void;
  onDelete: (education: Education) => void;
}) => {
  const { school, href, degree, logoUrl, start, end } = education;

  return (
    <Card className="hover:shadow-md transition-shadow h-full flex flex-col">
      {/* Header */}
      <CardHeader className="flex flex-col items-center pb-2">
        {logoUrl ? (
          <div className="relative w-20 h-20 mb-4">
            <Image
              src={logoUrl}
              alt={school}
              fill
              className="object-contain rounded-md"
              sizes="80px"
            />
          </div>
        ) : (
          <div className="w-20 h-20 mb-4 flex items-center justify-center bg-gray-100 dark:bg-slate-800 rounded-md text-gray-500 dark:text-slate-400 text-xl font-semibold">
            {school?.charAt(0) || "U"}
          </div>
        )}

        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg md:text-xl font-semibold text-center text-blue-600 hover:underline"
          >
            {school}
          </a>
        ) : (
          <h3 className="text-lg md:text-xl font-semibold text-center">
            {school}
          </h3>
        )}

        <p className="text-sm text-gray-500 dark:text-slate-400 text-center mt-1">{degree}</p>
      </CardHeader>

      {/* Content */}
      <CardContent className="text-center text-gray-600 dark:text-slate-300 flex-grow">
        <p className="text-xs text-gray-500 dark:text-slate-400">
          {start} – {end || "Present"}
        </p>
      </CardContent>

      {/* Footer */}
      <CardFooter className="flex justify-center gap-2 pt-2 pb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(education)}
          className="flex-1"
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(education)}
          className="flex-1"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
};
