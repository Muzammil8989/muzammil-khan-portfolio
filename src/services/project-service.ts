import { prisma, toMongoDoc } from "@/lib/prisma";
import { ProjectInput } from "@/core/validation/project";
import { AppError } from "@/core/errors/AppError";

export class ProjectService {
  static async getAll() {
    const docs = await prisma.project.findMany();
    return docs.map(toMongoDoc);
  }

  static async create(data: ProjectInput) {
    const result = await prisma.project.create({ data });
    return toMongoDoc(result);
  }

  static async update(id: string, data: Partial<ProjectInput>) {
    const result = await prisma.project
      .update({ where: { id }, data })
      .catch((e: any) => {
        if (e?.code === "P2025") {
          throw new AppError("NOT_FOUND", "Project not found", 404);
        }
        throw e;
      });
    return toMongoDoc(result);
  }

  static async delete(id: string) {
    await prisma.project.delete({ where: { id } }).catch((e: any) => {
      if (e?.code === "P2025") {
        throw new AppError("NOT_FOUND", "Project not found", 404);
      }
      throw e;
    });
    return { success: true };
  }
}
