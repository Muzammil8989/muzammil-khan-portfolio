import { NextRequest } from "next/server";
import { WorkService } from "@/services/work-service";
import { apiWrapper } from "@/lib/api-utils";
import { WorkExperienceSchema } from "@/core/validation/work";
import { getToken } from "next-auth/jwt";
import { AppError } from "@/core/errors/AppError";

export async function GET() {
  return apiWrapper(() => WorkService.getAll());
}

export async function POST(req: NextRequest) {
  return apiWrapper(async () => {
    const token = await getToken({ req });
    if (!token) throw new AppError("UNAUTHORIZED", "Unauthorized", 401);

    const body = await req.json();
    const validated = WorkExperienceSchema.parse(body);
    return WorkService.create(validated);
  }, 201);
}

export async function PUT(req: NextRequest) {
  return apiWrapper(async () => {
    const token = await getToken({ req });
    if (!token) throw new AppError("UNAUTHORIZED", "Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) throw new AppError("BAD_REQUEST", "Missing id", 400);

    const body = await req.json();
    const validated = WorkExperienceSchema.partial().parse(body);
    return WorkService.update(id, validated);
  });
}

export async function DELETE(req: NextRequest) {
  return apiWrapper(async () => {
    const token = await getToken({ req });
    if (!token) throw new AppError("UNAUTHORIZED", "Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) throw new AppError("BAD_REQUEST", "Missing id", 400);

    return WorkService.delete(id);
  });
}

