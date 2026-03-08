import { prisma, toMongoDoc } from "@/lib/prisma";
import { SkillInput } from "@/core/validation/skill";
import { AppError } from "@/core/errors/AppError";

export class SkillService {
  static async getAll() {
    const docs = await prisma.skill.findMany();
    return docs.map(toMongoDoc);
  }

  static async create(data: SkillInput) {
    const result = await prisma.skill.create({ data });
    return toMongoDoc(result);
  }

  static async update(id: string, data: Partial<SkillInput>) {
    const result = await prisma.skill
      .update({ where: { id }, data })
      .catch((e: any) => {
        if (e?.code === "P2025") {
          throw new AppError("NOT_FOUND", "Skill not found", 404);
        }
        throw e;
      });
    return toMongoDoc(result);
  }

  static async delete(id: string) {
    await prisma.skill.delete({ where: { id } }).catch((e: any) => {
      if (e?.code === "P2025") {
        throw new AppError("NOT_FOUND", "Skill not found", 404);
      }
      throw e;
    });
    return { success: true };
  }

  /** Bulk-store the skills string array in the metadata collection */
  static async updateMany(skills: string[]) {
    await prisma.metadata.upsert({
      where: { key: "skills" },
      create: { key: "skills", value: skills },
      update: { value: skills },
    });
    return skills;
  }

  /** Retrieve the bulk skills string array from metadata */
  static async getSkillsList(): Promise<string[]> {
    const doc = await prisma.metadata.findUnique({ where: { key: "skills" } });
    return (doc?.value as string[]) ?? [];
  }
}
