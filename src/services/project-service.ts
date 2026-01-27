import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { ProjectInput } from "@/core/validation/project";
import { AppError } from "@/core/errors/AppError";

const COLLECTION = "projects";

export class ProjectService {
    static async getAll() {
        const { db } = await connectToDatabase();
        const projects = await db.collection(COLLECTION).find({}).toArray();
        // Convert MongoDB documents to plain objects
        return projects.map(project => ({
            ...project,
            _id: project._id.toString(),
        }));
    }

    static async create(data: ProjectInput) {
        const { db } = await connectToDatabase();
        const result = await db.collection(COLLECTION).insertOne({
            ...data,
            createdAt: new Date(),
        });
        return { _id: result.insertedId.toString(), ...data };
    }

    static async update(id: string, data: Partial<ProjectInput>) {
        const { db } = await connectToDatabase();
        const result = await db.collection(COLLECTION).findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: { ...data, updatedAt: new Date() } },
            { returnDocument: "after" }
        );
        if (!result) throw new AppError("NOT_FOUND", "Project not found", 404);
        // Convert ObjectId to string
        return {
            ...result,
            _id: result._id.toString(),
        };
    }

    static async delete(id: string) {
        const { db } = await connectToDatabase();
        const result = await db.collection(COLLECTION).deleteOne({
            _id: new ObjectId(id),
        });
        if (result.deletedCount === 0)
            throw new AppError("NOT_FOUND", "Project not found", 404);
        return { success: true };
    }
}
