import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getToken } from "next-auth/jwt";
import { ObjectId } from "mongodb";

interface WorkExperience {
  _id: ObjectId;
  company: string;
  href: string;
  badges: string[];
  location: string;
  title: string;
  logoUrl: string;
  start: string;
  end: string;
  description: string;
}

/**
 * ✅ PUBLIC: GET - Fetch all work experiences
 * Example: /api/work
 */
export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const experiences = await db
      .collection<WorkExperience>("work_experiences")
      .find()
      .toArray();

    return NextResponse.json(experiences);
  } catch (error) {
    console.error("Error fetching work experiences:", error);
    return NextResponse.json(
      { message: "Error occurred while fetching work experiences." },
      { status: 500 }
    );
  }
}

/**
 * 🟢 POST - Create a new work experience
 */
export async function POST(req: NextRequest) {
  const token = await getToken({ req });
  if (!token?.sub) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { db } = await connectToDatabase();
    const data = await req.json();

    if (!data.company || !data.title || !data.start) {
      return NextResponse.json(
        { message: "Fields 'company', 'title', and 'start' are required." },
        { status: 400 }
      );
    }

    const newExperience: WorkExperience = {
      _id: new ObjectId(),
      company: data.company,
      href: data.href || "",
      badges: data.badges || [],
      location: data.location || "",
      title: data.title,
      logoUrl: data.logoUrl || "",
      start: data.start,
      end: data.end || "",
      description: data.description || "",
    };

    await db.collection("work_experiences").insertOne(newExperience);
    return NextResponse.json(newExperience, { status: 201 });
  } catch (error) {
    console.error("Error creating work experience:", error);
    return NextResponse.json(
      { message: "Error occurred while creating work experience." },
      { status: 500 }
    );
  }
}

/**
 * 🟡 PUT - Update a work experience by ID
 * Example: /api/work?id=WORK_ID
 */
export async function PUT(req: NextRequest) {
  const token = await getToken({ req });
  if (!token?.sub) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "Missing 'id' parameter" },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid 'id' parameter" },
        { status: 400 }
      );
    }

    const raw = await req.json();
    const { _id, createdAt, ...rest } = raw ?? {};

    const setPayload: Record<string, unknown> = {};
    const unsetPayload: Record<string, "" | 1> = {};

    Object.entries(rest).forEach(([k, v]) => {
      if (v === null) unsetPayload[k] = "";
      else if (v === "") setPayload[k] = v;
      else if (typeof v !== "undefined") setPayload[k] = v;
    });

    setPayload.updatedAt = new Date();

    const update: Record<string, unknown> = {};
    if (Object.keys(setPayload).length) update.$set = setPayload;
    if (Object.keys(unsetPayload).length) update.$unset = unsetPayload;

    if (!Object.keys(update).length) {
      return NextResponse.json(
        { message: "No valid fields to update." },
        { status: 400 }
      );
    }

    const updatedExperience =
      (await db
        .collection<WorkExperience>("work_experiences")
        .findOneAndUpdate({ _id: new ObjectId(id) }, update, {
          returnDocument: "after",
        })) ?? {};

    if (!updatedExperience) {
      return NextResponse.json(
        { message: "Work experience not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedExperience);
  } catch (error) {
    console.error("Error updating work experience:", error);
    return NextResponse.json(
      { message: "Error occurred while updating work experience." },
      { status: 500 }
    );
  }
}

/**
 * 🔴 DELETE - Delete a work experience by ID
 * Example: /api/work?id=WORK_ID
 */
export async function DELETE(req: NextRequest) {
  const token = await getToken({ req });
  if (!token?.sub) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "Missing 'id' parameter" },
        { status: 400 }
      );
    }

    const { deletedCount } = await db
      .collection("work_experiences")
      .deleteOne({ _id: new ObjectId(id) });

    if (!deletedCount) {
      return NextResponse.json(
        { message: "Work experience not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Error deleting work experience:", error);
    return NextResponse.json(
      { message: "Error occurred while deleting work experience." },
      { status: 500 }
    );
  }
}
