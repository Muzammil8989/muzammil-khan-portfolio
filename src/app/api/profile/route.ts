import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

interface Profile {
  _id: ObjectId;
  name: string;
  description: string;
  avatarUrl: string;
  initials: string;
}

/**
 * ✅ PUBLIC: GET - Fetches any user's profile by ID (from query param)
 * Example: /api/profile?id=USER_ID
 */
export async function GET(req: NextRequest) {
  try {
    const { db } = await connectToDatabase();

    const profiles = await db.collection<Profile>("profiles").find().toArray();

    return NextResponse.json(profiles);
  } catch (error) {
    console.error("Error fetching all profiles:", error);
    return NextResponse.json(
      { message: "Error occurred while fetching profiles." },
      { status: 500 }
    );
  }
}

/**
 * 🔒 PROTECTED: POST - Create a profile for the authenticated user
 */
export async function POST(req: NextRequest) {
  const token = await getToken({ req });
  if (!token?.sub) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { db } = await connectToDatabase();
    const userId = new ObjectId(token.sub);

    const existingProfile = await db
      .collection("profiles")
      .findOne({ _id: userId });
    if (existingProfile) {
      return NextResponse.json(
        { message: "Profile already exists." },
        { status: 409 }
      );
    }

    const profileData: Omit<Profile, "_id"> = await req.json();

    const newProfile: Profile = {
      _id: userId,
      ...profileData,
    };

    await db.collection<Profile>("profiles").insertOne(newProfile);

    return NextResponse.json(newProfile, { status: 201 });
  } catch (error) {
    console.error("Error creating profile:", error);
    return NextResponse.json(
      { message: "Error occurred while creating profile." },
      { status: 500 }
    );
  }
}

/**
 * 🔒 PROTECTED: PUT - Update authenticated user's profile
 */
export async function PUT(req: NextRequest) {
  const token = await getToken({ req });
  if (!token?.sub) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { db } = await connectToDatabase();
    const userId = new ObjectId(token.sub);

    // Explicitly remove _id from incoming data
    const rawData = await req.json();
    const { _id, ...profileUpdateData } = rawData;

    const result = await db
      .collection<Profile>("profiles")
      .findOneAndUpdate(
        { _id: userId },
        { $set: profileUpdateData },
        { returnDocument: "after" }
      );

    if (!result) {
      return NextResponse.json(
        { message: "Profile not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { message: "Error occurred while updating profile." },
      { status: 500 }
    );
  }
}

/**
 * 🔒 PROTECTED: DELETE - Delete authenticated user's profile
 */
export async function DELETE(req: NextRequest) {
  const token = await getToken({ req });
  if (!token?.sub) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { db } = await connectToDatabase();
    const userId = new ObjectId(token.sub);

    const result = await db
      .collection("profiles")
      .findOneAndDelete({ _id: userId });

    if (result && result.value) {
      return NextResponse.json(
        { message: "Profile not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Profile deleted successfully." });
  } catch (error) {
    console.error("Error deleting profile:", error);
    return NextResponse.json(
      { message: "Error occurred while deleting profile." },
      { status: 500 }
    );
  }
}
