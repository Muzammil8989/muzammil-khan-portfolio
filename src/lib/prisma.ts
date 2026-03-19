import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error"]
        : ["error"],
  });

// Cache in all environments — critical for serverless (Vercel) production
globalForPrisma.prisma = globalForPrisma.prisma ?? prisma;

/**
 * Maps Prisma's `id` field back to `_id` for backward compatibility
 * with existing API contracts and client-side types.
 */
export function toMongoDoc<T extends { id: string }>(
  doc: T,
): Omit<T, "id"> & { _id: string } {
  const { id, ...rest } = doc;
  return { ...rest, _id: id };
}
