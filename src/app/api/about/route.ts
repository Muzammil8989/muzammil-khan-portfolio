import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getToken } from "next-auth/jwt";
import { ObjectId } from "mongodb";

// Define the About interface
interface About {
  _id?: ObjectId;
  message: string;
}

/**
 * ✅ PUBLIC: GET - Fetch the "about" message
 * Example: /api/about
 */
export async function GET(req: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const about = await db.collection<About>("about").findOne({});

    if (about) {
      // Convert ObjectId to string for JSON serialization
      const responseData = {
        ...about,
        _id: about._id?.toString(),
      };
      return NextResponse.json(responseData, { status: 200 });
    } else {
      // If no data found, provide clear message and status 404
      return NextResponse.json(
        { message: "About section not found. Please create it using POST." },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error fetching about section:", error);
    // Add more detailed error logging if necessary
    return NextResponse.json(
      { message: "An error occurred while fetching the about section." },
      { status: 500 }
    );
  }
}


/**
 * 🔒 PROTECTED: POST - Create or update the about section message
 */
export async function POST(req: NextRequest) {
  const token = await getToken({ req });
  if (!token?.sub) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { db } = await connectToDatabase();

    const aboutData: { message: string } = await req.json();

    // Validate required fields
    if (!aboutData.message) {
      return NextResponse.json(
        { message: "Message is required" },
        { status: 400 }
      );
    }

    // Check if the "about" section already exists
    const existingAbout = await db.collection<About>("about").findOne({});

    if (existingAbout) {
      // Update the existing about section
      await db
        .collection<About>("about")
        .updateOne({}, { $set: { message: aboutData.message } });
      return NextResponse.json(
        {
          message: "About section updated successfully.",
          _id: existingAbout._id?.toString(),
        },
        { status: 200 }
      );
    } else {
      // Create a new about section
      const result = await db.collection<About>("about").insertOne({
        message: aboutData.message,
      });
      return NextResponse.json(
        {
          message: "About section created successfully.",
          _id: result.insertedId.toString(),
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Error creating/updating about section:", error);
    return NextResponse.json(
      { message: "Error occurred while creating/updating about section." },
      { status: 500 }
    );
  }
}

/**
 * 🔒 PROTECTED: PUT - Update the about section
 */
export async function PUT(req: NextRequest) {
  const token = await getToken({ req });
  if (!token?.sub) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { db } = await connectToDatabase();

    const aboutData: { message: string } = await req.json();

    // Validate required fields
    if (!aboutData.message) {
      return NextResponse.json(
        { message: "Message is required" },
        { status: 400 }
      );
    }

    // Check if about section exists
    const existingAbout = await db.collection<About>("about").findOne({});

    if (!existingAbout) {
      return NextResponse.json(
        { message: "About section not found. Use POST to create one." },
        { status: 404 }
      );
    }

    // Update the about section
    const result = await db
      .collection<About>("about")
      .updateOne(
        { _id: existingAbout._id },
        { $set: { message: aboutData.message } }
      );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { message: "About section not found or no changes made." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "About section updated successfully.",
        _id: existingAbout._id?.toString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating about section:", error);
    return NextResponse.json(
      { message: "Error occurred while updating about section." },
      { status: 500 }
    );
  }
}

/**
 * 🔒 PROTECTED: DELETE - Delete the about section
 */
export async function DELETE(req: NextRequest) {
  const token = await getToken({ req });
  if (!token?.sub) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { db } = await connectToDatabase();

    // Delete the about section
    const result = await db.collection<About>("about").deleteOne({});

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: "About section not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "About section deleted successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting about section:", error);
    return NextResponse.json(
      { message: "Error occurred while deleting about section." },
      { status: 500 }
    );
  }
}
