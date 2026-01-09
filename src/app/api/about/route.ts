import { NextRequest } from "next/server";
import { AboutService } from "@/services/about-service";
import { apiWrapper } from "@/lib/api-utils";
import { AboutSchema } from "@/core/validation/about";
import { getToken } from "next-auth/jwt";
import { AppError } from "@/core/errors/AppError";

export async function GET() {
  return apiWrapper(async () => {
    const about = await AboutService.get();
    if (!about) throw new AppError("NOT_FOUND", "About section not found", 404);
    return about;
  });
}

export async function POST(req: NextRequest) {
  return apiWrapper(async () => {
    const token = await getToken({ req });
    if (!token) throw new AppError("UNAUTHORIZED", "Unauthorized", 401);

    const body = await req.json();
    const validated = AboutSchema.parse(body);
    return AboutService.upsert(validated);
  }, 201);
}

export async function PUT(req: NextRequest) {
  // Support both versions, but internally they do the same for a singleton
  return POST(req);
}

export async function DELETE(req: NextRequest) {
  return apiWrapper(async () => {
    const token = await getToken({ req });
    if (!token) throw new AppError("UNAUTHORIZED", "Unauthorized", 401);

    return AboutService.delete();
  });
}

