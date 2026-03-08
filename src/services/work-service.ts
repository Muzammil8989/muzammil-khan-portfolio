// src/services/work-service.ts
import { prisma, toMongoDoc } from "@/lib/prisma";
import { AppError } from "@/core/errors/AppError";
import { WorkExperienceInput } from "@/core/validation/work";

export class WorkService {
  static async getAll() {
    const docs = await prisma.workExperience.findMany({
      orderBy: { start: "desc" },
    });
    return docs.map(toMongoDoc);
  }

  static async create(data: WorkExperienceInput) {
    const result = await prisma.workExperience.create({ data });
    return toMongoDoc(result);
  }

  static async update(id: string, data: Partial<WorkExperienceInput>) {
    const { id: _discarded, ...rest } = data as any;

    const result = await prisma.workExperience
      .update({ where: { id }, data: rest })
      .catch((e: any) => {
        if (e?.code === "P2025") {
          throw new AppError("NOT_FOUND", "Work experience not found", 404);
        }
        if (e?.code === "P2023") {
          throw new AppError("BAD_REQUEST", "Invalid ID format", 400);
        }
        throw e;
      });

    return toMongoDoc(result);
  }

  static async delete(id: string) {
    await prisma.workExperience.delete({ where: { id } }).catch((e: any) => {
      if (e?.code === "P2025") {
        throw new AppError("NOT_FOUND", "Work experience not found", 404);
      }
      if (e?.code === "P2023") {
        throw new AppError("BAD_REQUEST", "Invalid ID format", 400);
      }
      throw e;
    });
    return { success: true };
  }
}
