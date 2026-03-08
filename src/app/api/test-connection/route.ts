// app/api/test-connection/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // A lightweight ping — count blogs without fetching any data
    await prisma.$runCommandRaw({ ping: 1 });
    return NextResponse.json({
      status: "success",
      message: "Database connected successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: "Database connection failed",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
