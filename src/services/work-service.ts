// src/services/work-service.ts
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { AppError } from "@/core/errors/AppError";
import { WorkExperienceInput } from "@/core/validation/work";

export class WorkService {
    private static collection = "work_experiences";

    static async getAll() {
        const { db } = await connectToDatabase();
        return db.collection(this.collection).find().sort({ start: -1 }).toArray();
    }

    static async create(data: WorkExperienceInput) {
        const { db } = await connectToDatabase();
        const result = await db.collection(this.collection).insertOne({
            ...data,
            _id: new ObjectId(),
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        return result;
    }

    static async update(id: string, data: Partial<WorkExperienceInput>) {
        if (!ObjectId.isValid(id)) {
            throw new AppError("BAD_REQUEST", "Invalid ID format", 400);
        }

        const { db } = await connectToDatabase();
        const { id: _, ...updateData } = data;

        const result = await db.collection(this.collection).findOneAndUpdate(
            { _id: new ObjectId(id) },
            {
                $set: { ...updateData, updatedAt: new Date() }
            },
            { returnDocument: "after" }
        );

        if (!result) {
            throw new AppError("NOT_FOUND", "Work experience not found", 404);
        }

        return result;
    }

    static async delete(id: string) {
        if (!ObjectId.isValid(id)) {
            throw new AppError("BAD_REQUEST", "Invalid ID format", 400);
        }

        const { db } = await connectToDatabase();
        const result = await db.collection(this.collection).deleteOne({
            _id: new ObjectId(id),
        });

        if (result.deletedCount === 0) {
            throw new AppError("NOT_FOUND", "Work experience not found", 404);
        }

        return { success: true };
    }
}
