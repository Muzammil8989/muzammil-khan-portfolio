// src/services/about-service.ts
import { prisma, toMongoDoc } from "@/lib/prisma";
import { AppError } from "@/core/errors/AppError";
import { AboutInput } from "@/core/validation/about";

export class AboutService {
  static async get() {
    const doc = await prisma.about.findFirst();
    return doc ? toMongoDoc(doc) : null;
  }

  static async upsert(data: AboutInput) {
    const existing = await prisma.about.findFirst();

    if (existing) {
      const result = await prisma.about.update({
        where: { id: existing.id },
        data: { message: data.message },
      });
      return toMongoDoc(result);
    }

    const result = await prisma.about.create({
      data: { message: data.message },
    });
    return toMongoDoc(result);
  }

  static async delete() {
    const existing = await prisma.about.findFirst();
    if (!existing) {
      throw new AppError("NOT_FOUND", "About section not found", 404);
    }
    await prisma.about.delete({ where: { id: existing.id } });
    return { success: true };
  }
}
