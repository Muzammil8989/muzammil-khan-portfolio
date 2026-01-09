import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { ProjectInput } from "@/core/validation/project";
import { AppError } from "@/core/errors/AppError";

const COLLECTION = "projects";

export class ProjectService {
    static async getAll() {
        const client = await clientPromise;
        const db = client.db();
        return db.collection(COLLECTION).find({}).toArray();
    }

    static async create(data: ProjectInput) {
        const client = await clientPromise;
        const db = client.db();
        const result = await db.collection(COLLECTION).insertOne({
            ...data,
            createdAt: new Date(),
        });
        return { _id: result.insertedId, ...data };
    }

    static async update(id: string, data: Partial<ProjectInput>) {
        const client = await clientPromise;
        const db = client.db();
        const result = await db.collection(COLLECTION).findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: { ...data, updatedAt: new Date() } },
            { returnDocument: "after" }
        );
        if (!result) throw new AppError("NOT_FOUND", "Project not found", 404);
        return result;
    }

    static async delete(id: string) {
        const client = await clientPromise;
        const db = client.db();
        const result = await db.collection(COLLECTION).deleteOne({
            _id: new ObjectId(id),
        });
        if (result.deletedCount === 0)
            throw new AppError("NOT_FOUND", "Project not found", 404);
        return { success: true };
    }
}
