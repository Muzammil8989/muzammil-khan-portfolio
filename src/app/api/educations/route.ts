// app/api/education/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getToken } from "next-auth/jwt";
import { ObjectId } from "mongodb";

/** Allowed fields only */
type EducationFields =
  | "school"
  | "href"
  | "degree"
  | "logoUrl"
  | "start"
  | "end";

const ALLOWED_KEYS: EducationFields[] = [
  "school",
  "href",
  "degree",
  "logoUrl",
  "start",
  "end",
];

interface Education {
  _id: ObjectId;
  school: string;
  href: string;
  degree: string;
  logoUrl: string;
  start: string;
  end: string;
}

/** Pick only whitelisted keys */
function pickAllowed<T extends Record<string, unknown>>(obj: T) {
  const out: Partial<Record<EducationFields, unknown>> = {};
  for (const k of ALLOWED_KEYS) {
    if (k in obj) out[k] = obj[k];
  }
  return out;
}

/** Validate required fields for create */
function validateCreate(body: any) {
  const missing: string[] = [];
  if (!body.school) missing.push("school");
  if (!body.degree) missing.push("degree");
  if (!body.start) missing.push("start");
  if (missing.length) {
    return `Missing required field(s): ${missing.join(", ")}`;
  }
  return null;
}

/** GET: list all */
export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const items = await db.collection<Education>("educations").find().toArray();
    return NextResponse.json(items);
  } catch (e) {
    console.error("GET /education failed:", e);
    return NextResponse.json(
      { message: "Failed to fetch education items." },
      { status: 500 }
    );
  }
}

/** POST: create (only these 6 fields are stored) */
export async function POST(req: NextRequest) {
  const token = await getToken({ req });
  if (!token?.sub) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { db } = await connectToDatabase();
    const raw = await req.json();
    const data = pickAllowed(raw);

    const err = validateCreate(data);
    if (err) {
      return NextResponse.json({ message: err }, { status: 400 });
    }

    const doc: Education = {
      _id: new ObjectId(),
      school: String(data.school),
      href: String(data.href ?? ""),
      degree: String(data.degree),
      logoUrl: String(data.logoUrl ?? ""),
      start: String(data.start),
      end: String(data.end ?? ""),
    };

    await db.collection<Education>("educations").insertOne(doc);
    return NextResponse.json(doc, { status: 201 });
  } catch (e) {
    console.error("POST /education failed:", e);
    return NextResponse.json(
      { message: "Failed to create education item." },
      { status: 500 }
    );
  }
}

/** PUT: update by id (only these 6 fields can be changed)
 *  - null values are treated as $unset
 *  - "" sets empty string
 *  Example: /api/education?id=<ID>
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

    if (!id)
      return NextResponse.json(
        { message: "Missing 'id' parameter" },
        { status: 400 }
      );
    if (!ObjectId.isValid(id))
      return NextResponse.json(
        { message: "Invalid 'id' parameter" },
        { status: 400 }
      );

    const raw = await req.json();
    const data = pickAllowed(raw);

    const $set: Record<string, unknown> = {};
    const $unset: Record<string, "" | 1> = {};

    for (const [k, v] of Object.entries(data)) {
      if (v === null) $unset[k] = "";
      else if (typeof v !== "undefined") $set[k] = v;
    }

    const update: Record<string, unknown> = {};
    if (Object.keys($set).length) update.$set = $set;
    if (Object.keys($unset).length) update.$unset = $unset;

    if (!Object.keys(update).length) {
      return NextResponse.json(
        { message: "No valid fields to update." },
        { status: 400 }
      );
    }

    const result = await db
      .collection<Education>("educations")
      .findOneAndUpdate({ _id: new ObjectId(id) }, update, {
        returnDocument: "after",
      });

    if (!result) {
      return NextResponse.json(
        { message: "Education item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (e) {
    console.error("PUT /education failed:", e);
    return NextResponse.json(
      { message: "Failed to update education item." },
      { status: 500 }
    );
  }
}

/** DELETE: delete by id */
export async function DELETE(req: NextRequest) {
  const token = await getToken({ req });
  if (!token?.sub) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id)
      return NextResponse.json(
        { message: "Missing 'id' parameter" },
        { status: 400 }
      );
    if (!ObjectId.isValid(id))
      return NextResponse.json(
        { message: "Invalid 'id' parameter" },
        { status: 400 }
      );

    const { deletedCount } = await db
      .collection("educations")
      .deleteOne({ _id: new ObjectId(id) });

    if (!deletedCount) {
      return NextResponse.json(
        { message: "Education item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (e) {
    console.error("DELETE /education failed:", e);
    return NextResponse.json(
      { message: "Failed to delete education item." },
      { status: 500 }
    );
  }
}
