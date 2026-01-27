import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { SkillInput } from "@/core/validation/skill";
import { AppError } from "@/core/errors/AppError";

const COLLECTION = "skills";

export class SkillService {
    static async getAll() {
        const { db } = await connectToDatabase();
        return db.collection(COLLECTION).find({}).toArray();
    }

    static async create(data: SkillInput) {
        const { db } = await connectToDatabase();
        const id = new ObjectId();
        const now = new Date();
        const newDoc = {
            ...data,
            _id: id,
            createdAt: now,
        };
        await db.collection(COLLECTION).insertOne(newDoc);
        return {
            ...data,
            _id: id.toString(),
            createdAt: now.toISOString(),
        };
    }

    static async update(id: string, data: Partial<SkillInput>) {
        const { db } = await connectToDatabase();
        const result = await db.collection(COLLECTION).findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: { ...data, updatedAt: new Date() } },
            { returnDocument: "after" }
        );
        if (!result) throw new AppError("NOT_FOUND", "Skill not found", 404);
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
            throw new AppError("NOT_FOUND", "Skill not found", 404);
        return { success: true };
    }

    static async updateMany(skills: string[]) {
        const { db } = await connectToDatabase();
        // This is for a pattern where we just keep a list of strings
        await db.collection("metadata").updateOne(
            { key: "skills" },
            { $set: { value: skills, updatedAt: new Date() } },
            { upsert: true }
        );
        return skills;
    }

    static async getSkillsList() {
        const { db } = await connectToDatabase();
        const doc = await db.collection("metadata").findOne({ key: "skills" });
        return doc?.value || [];
    }
}
