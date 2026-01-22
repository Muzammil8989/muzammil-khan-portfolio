import { connectToDatabase } from "@/lib/mongodb";
import { BlogInput } from "@/core/validation/blog";
import { ObjectId } from "mongodb";
import { AppError } from "@/core/errors/AppError";
import { calculateReadingTime, generateSlug } from "@/lib/blog-utils";

const COLLECTION_NAME = "blogs";

// Re-export for backwards compatibility
export { generateSlug };

export class BlogService {
  /**
   * Get all blogs with optional filtering
   */
  static async getAll(filters?: {
    status?: "draft" | "published" | "archived";
    tag?: string;
    difficulty?: "beginner" | "intermediate" | "advanced";
  }) {
    const { db } = await connectToDatabase();
    const collection = db.collection(COLLECTION_NAME);

    const query: any = {};

    if (filters?.status) {
      query.status = filters.status;
    }

    if (filters?.tag) {
      query.tags = { $in: [filters.tag] };
    }

    if (filters?.difficulty) {
      query.difficulty = filters.difficulty;
    }

    const blogs = await collection
      .find(query)
      .sort({ publishedAt: -1, createdAt: -1 })
      .toArray();

    return blogs.map((blog) => ({
      ...blog,
      _id: blog._id.toString(),
    }));
  }

  /**
   * Get blog by slug
   */
  static async getBySlug(slug: string) {
    const { db } = await connectToDatabase();
    const collection = db.collection(COLLECTION_NAME);

    const blog = await collection.findOne({ slug });

    if (!blog) {
      throw new AppError("NOT_FOUND", "Blog post not found", 404);
    }

    return {
      ...blog,
      _id: blog._id.toString(),
    };
  }

  /**
   * Get blog by ID
   */
  static async getById(id: string) {
    if (!ObjectId.isValid(id)) {
      throw new AppError(
        "BAD_REQUEST",
        "Invalid blog ID format",
        400
      );
    }

    const { db } = await connectToDatabase();
    const collection = db.collection(COLLECTION_NAME);

    const blog = await collection.findOne({ _id: new ObjectId(id) });

    if (!blog) {
      throw new AppError(
        "NOT_FOUND",
        "Blog post not found",
        404
      );
    }

    return {
      ...blog,
      _id: blog._id.toString(),
    };
  }

  /**
   * Search blogs by title or content
   */
  static async search(query: string) {
    const { db } = await connectToDatabase();
    const collection = db.collection(COLLECTION_NAME);

    const blogs = await collection
      .find({
        $or: [
          { title: { $regex: query, $options: "i" } },
          { content: { $regex: query, $options: "i" } },
          { tags: { $in: [new RegExp(query, "i")] } },
        ],
        status: "published",
      })
      .sort({ publishedAt: -1 })
      .toArray();

    return blogs.map((blog) => ({
      ...blog,
      _id: blog._id.toString(),
    }));
  }

  /**
   * Create new blog post
   */
  static async create(data: BlogInput) {
    const { db } = await connectToDatabase();
    const collection = db.collection(COLLECTION_NAME);

    // Calculate reading time
    const readingTime = calculateReadingTime(data.content);

    // Check if slug already exists
    const existingBlog = await collection.findOne({ slug: data.slug });
    if (existingBlog) {
      throw new AppError(
        "BAD_REQUEST",
        "A blog with this slug already exists",
        400
      );
    }

    const now = new Date().toISOString();

    const blogData = {
      ...data,
      readingTime,
      createdAt: now,
      updatedAt: now,
      likes: 0,
      version: 1,
    };

    const result = await collection.insertOne(blogData);

    return {
      _id: result.insertedId.toString(),
      ...blogData,
    };
  }

  /**
   * Update existing blog post
   */
  static async update(id: string, data: Partial<BlogInput>) {
    if (!ObjectId.isValid(id)) {
      throw new AppError(
        "BAD_REQUEST",
        "Invalid blog ID format",
        400
      );
    }

    const { db } = await connectToDatabase();
    const collection = db.collection(COLLECTION_NAME);

    // If content is being updated, recalculate reading time
    const updateData: any = { ...data };
    if (data.content) {
      updateData.readingTime = calculateReadingTime(data.content);
    }

    // Increment version
    updateData.updatedAt = new Date().toISOString();
    updateData.$inc = { version: 1 };

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: updateData,
        $inc: { version: 1 }
      },
      { returnDocument: "after" }
    );

    if (!result) {
      throw new AppError(
        "NOT_FOUND",
        "Blog post not found",
        404
      );
    }

    return {
      ...result,
      _id: result._id.toString(),
    };
  }

  /**
   * Delete blog post
   */
  static async delete(id: string) {
    if (!ObjectId.isValid(id)) {
      throw new AppError(
        "BAD_REQUEST",
        "Invalid blog ID format",
        400
      );
    }

    const { db } = await connectToDatabase();
    const collection = db.collection(COLLECTION_NAME);

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      throw new AppError(
        "NOT_FOUND",
        "Blog post not found",
        404
      );
    }

    return { success: true };
  }

  /**
   * Publish a draft blog
   */
  static async publish(id: string) {
    if (!ObjectId.isValid(id)) {
      throw new AppError(
        "BAD_REQUEST",
        "Invalid blog ID format",
        400
      );
    }

    const { db } = await connectToDatabase();
    const collection = db.collection(COLLECTION_NAME);

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: "published",
          publishedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        $inc: { version: 1 }
      },
      { returnDocument: "after" }
    );

    if (!result) {
      throw new AppError(
        "NOT_FOUND",
        "Blog post not found",
        404
      );
    }

    return {
      ...result,
      _id: result._id.toString(),
    };
  }

  /**
   * Increment likes count with user tracking (IP-based)
   */
  static async incrementLikes(id: string, userIdentifier: string) {
    if (!ObjectId.isValid(id)) {
      throw new AppError("BAD_REQUEST", "Invalid blog ID format", 400);
    }

    const { db } = await connectToDatabase();
    const collection = db.collection(COLLECTION_NAME);

    // Check if user has already liked this blog
    const blog = await collection.findOne({
      _id: new ObjectId(id),
      likedBy: { $in: [userIdentifier] },
    });

    if (blog) {
      throw new AppError("BAD_REQUEST", "You have already liked this blog", 400);
    }

    // Add identifier and increment likes
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $inc: { likes: 1 },
        $addToSet: { likedBy: userIdentifier },
      },
      { returnDocument: "after" }
    );

    if (!result) {
      throw new AppError("NOT_FOUND", "Blog post not found", 404);
    }

    return {
      ...result,
      _id: result._id.toString(),
    };
  }

  /**
   * Get all unique tags
   */
  static async getAllTags() {
    const { db } = await connectToDatabase();
    const collection = db.collection(COLLECTION_NAME);

    const tags = await collection.distinct("tags", { status: "published" });
    return tags;
  }

  /**
   * Get featured blogs (most viewed or liked)
   */
  static async getFeatured(limit: number = 3) {
    const { db } = await connectToDatabase();
    const collection = db.collection(COLLECTION_NAME);

    const blogs = await collection
      .find({ status: "published" })
      .sort({ likes: -1, createdAt: -1 })
      .limit(limit)
      .toArray();

    return blogs.map((blog) => ({
      ...blog,
      _id: blog._id.toString(),
    }));
  }
}
