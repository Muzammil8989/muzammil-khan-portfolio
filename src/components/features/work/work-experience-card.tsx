"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { WorkExperience } from "@/services/work";
import { Edit, Trash2 } from "lucide-react";
import Image from "next/image";

export const WorkExperienceCard = ({
  work,
  onEdit,
  onDelete,
}: {
  work: WorkExperience;
  onEdit: (work: WorkExperience) => void;
  onDelete: (work: WorkExperience) => void;
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow h-full flex flex-col">
      {/* Header */}
      <CardHeader className="flex flex-col items-center pb-2">
        {work.logoUrl ? (
          <div className="relative w-20 h-20 mb-4">
            <Image
              src={work.logoUrl}
              alt={work.company}
              fill
              className="object-contain rounded-md"
            />
          </div>
        ) : (
          <div className="w-20 h-20 mb-4 flex items-center justify-center bg-gray-100 rounded-md text-gray-500 text-xl font-semibold">
            {work.company.charAt(0)}
          </div>
        )}

        {work.href ? (
          <a
            href={work.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg md:text-xl font-semibold text-center text-blue-600 hover:underline"
          >
            {work.company}
          </a>
        ) : (
          <h3 className="text-lg md:text-xl font-semibold text-center">
            {work.company}
          </h3>
        )}

        <p className="text-sm text-gray-500 text-center mt-1">
          {work.title}
        </p>
      </CardHeader>

      {/* Content */}
      <CardContent className="text-center text-gray-600 flex-grow">
        <p className="text-sm mb-2 font-medium text-gray-700">
          {work.location}
        </p>
        <p className="text-xs text-gray-500 mb-3">
          {work.start} – {work.end || "Present"}
        </p>
        <p className="line-clamp-3">{work.description}</p>
      </CardContent>

      {/* Footer */}
      <CardFooter className="flex justify-center gap-2 pt-2 pb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(work)}
          className="flex-1"
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(work)}
          className="flex-1"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
};
