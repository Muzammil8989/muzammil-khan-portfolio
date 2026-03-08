// src/services/profile-service.ts
import { prisma, toMongoDoc } from "@/lib/prisma";
import { AppError } from "@/core/errors/AppError";
import { ProfileInput } from "@/core/validation/profile";

export class ProfileService {
  static async getAll() {
    const docs = await prisma.profile.findMany();
    return docs.map(toMongoDoc);
  }

  static async getById(id: string) {
    const doc = await prisma.profile
      .findUnique({ where: { id } })
      .catch((e: any) => {
        if (e?.code === "P2023") {
          throw new AppError("BAD_REQUEST", "Invalid ID", 400);
        }
        throw e;
      });
    return doc ? toMongoDoc(doc) : null;
  }

  static async create(id: string, data: ProfileInput) {
    const { id: _discarded, ...rest } = data as any;
    const result = await prisma.profile.create({
      data: { id, ...rest },
    });
    return toMongoDoc(result);
  }

  static async update(id: string, data: Partial<ProfileInput>) {
    const { id: _discarded, ...rest } = data as any;

    const result = await prisma.profile
      .update({ where: { id }, data: rest })
      .catch((e: any) => {
        if (e?.code === "P2025") {
          throw new AppError("NOT_FOUND", "Profile not found", 404);
        }
        if (e?.code === "P2023") {
          throw new AppError("BAD_REQUEST", "Invalid ID format", 400);
        }
        throw e;
      });

    return toMongoDoc(result);
  }

  static async delete(id: string) {
    await prisma.profile.delete({ where: { id } }).catch((e: any) => {
      if (e?.code === "P2025") {
        throw new AppError("NOT_FOUND", "Profile not found", 404);
      }
      if (e?.code === "P2023") {
        throw new AppError("BAD_REQUEST", "Invalid ID format", 400);
      }
      throw e;
    });
    return { success: true };
  }
}
