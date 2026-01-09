// src/services/about-service.ts
import { connectToDatabase } from "@/lib/mongodb";
import { AppError } from "@/core/errors/AppError";
import { AboutInput } from "@/core/validation/about";

export class AboutService {
    private static collection = "about";

    static async get() {
        const { db } = await connectToDatabase();
        return db.collection(this.collection).findOne({});
    }

    static async upsert(data: AboutInput) {
        const { db } = await connectToDatabase();
        const result = await db.collection(this.collection).findOneAndUpdate(
            {},
            {
                $set: {
                    message: data.message,
                    updatedAt: new Date()
                }
            },
            { upsert: true, returnDocument: "after" }
        );
        return result;
    }

    static async delete() {
        const { db } = await connectToDatabase();
        const result = await db.collection(this.collection).deleteOne({});
        if (result.deletedCount === 0) {
            throw new AppError("NOT_FOUND", "About section not found", 404);
        }
        return { success: true };
    }
}
