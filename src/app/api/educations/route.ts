import { NextRequest } from "next/server";
import { EducationService } from "@/services/education-service";
import { apiWrapper } from "@/lib/api-utils";
import { EducationSchema } from "@/core/validation/education";
import { getToken } from "next-auth/jwt";
import { AppError } from "@/core/errors/AppError";

export async function GET() {
  return apiWrapper(() => EducationService.getAll());
}

export async function POST(req: NextRequest) {
  return apiWrapper(async () => {
    const token = await getToken({ req });
    if (!token) throw new AppError("UNAUTHORIZED", "Unauthorized", 401);

    const body = await req.json();
    const validated = EducationSchema.parse(body);
    return EducationService.create(validated);
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
    const validated = EducationSchema.partial().parse(body);
    return EducationService.update(id, validated);
  });
}

export async function DELETE(req: NextRequest) {
  return apiWrapper(async () => {
    const token = await getToken({ req });
    if (!token) throw new AppError("UNAUTHORIZED", "Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) throw new AppError("BAD_REQUEST", "Missing id", 400);

    return EducationService.delete(id);
  });
}

