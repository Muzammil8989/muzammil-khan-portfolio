// src/services/education-service.ts
import { prisma, toMongoDoc } from "@/lib/prisma";
import { AppError } from "@/core/errors/AppError";
import { EducationInput } from "@/core/validation/education";

export class EducationService {
  static async getAll() {
    const docs = await prisma.education.findMany({
      orderBy: { start: "desc" },
    });
    return docs.map(toMongoDoc);
  }

  static async create(data: EducationInput) {
    const result = await prisma.education.create({ data });
    return toMongoDoc(result);
  }

  static async update(id: string, data: Partial<EducationInput>) {
    const { id: _discarded, ...rest } = data as any;

    const result = await prisma.education
      .update({ where: { id }, data: rest })
      .catch((e: any) => {
        if (e?.code === "P2025") {
          throw new AppError("NOT_FOUND", "Education entry not found", 404);
        }
        if (e?.code === "P2023") {
          throw new AppError("BAD_REQUEST", "Invalid ID format", 400);
        }
        throw e;
      });

    return toMongoDoc(result);
  }

  static async delete(id: string) {
    await prisma.education.delete({ where: { id } }).catch((e: any) => {
      if (e?.code === "P2025") {
        throw new AppError("NOT_FOUND", "Education entry not found", 404);
      }
      if (e?.code === "P2023") {
        throw new AppError("BAD_REQUEST", "Invalid ID format", 400);
      }
      throw e;
    });
    return { success: true };
  }
}
