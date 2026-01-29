// src/services/profile.server.ts
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { AppError } from "@/core/errors/AppError";
import { ProfileInput } from "@/core/validation/profile";

export class ProfileService {
    private static collection = "profiles";

    static async getAll() {
        const { db } = await connectToDatabase();
        return db.collection(this.collection).find().toArray();
    }

    static async getById(id: string) {
        if (!ObjectId.isValid(id)) throw new AppError("BAD_REQUEST", "Invalid ID", 400);
        const { db } = await connectToDatabase();
        return db.collection(this.collection).findOne({ _id: new ObjectId(id) });
    }

    static async create(id: string, data: ProfileInput) {
        const { db } = await connectToDatabase();
        // In this app, the profile ID usually matches the user ID (based on original route)
        const objectId = new ObjectId(id);
        const now = new Date();
        const newDoc = {
            ...data,
            _id: objectId,
            createdAt: now,
            updatedAt: now,
        };
        await db.collection(this.collection).insertOne(newDoc);
        return {
            ...data,
            _id: objectId.toString(),
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
        };
    }

    static async update(id: string, data: Partial<ProfileInput>) {
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
            throw new AppError("NOT_FOUND", "Profile not found", 404);
        }

        return {
            ...result,
            _id: result._id.toString(),
        };
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
            throw new AppError("NOT_FOUND", "Profile not found", 404);
        }

        return { success: true };
    }
}
