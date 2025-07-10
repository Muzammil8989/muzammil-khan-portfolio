// app/api/test-connection/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    await connectToDatabase();
    return NextResponse.json({
      status: "success",
      message: "MongoDB connected successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: "MongoDB connection failed",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
