import { NextRequest } from "next/server";
import { ProfileService } from "@/services/profile-service";
import { apiWrapper } from "@/lib/api-utils";
import { ProfileSchema } from "@/core/validation/profile";
import { getToken } from "next-auth/jwt";
import { AppError } from "@/core/errors/AppError";

export async function GET() {
  return apiWrapper(() => ProfileService.getAll());
}

export async function POST(req: NextRequest) {
  return apiWrapper(async () => {
    const token = await getToken({ req });
    if (!token?.sub) throw new AppError("UNAUTHORIZED", "Unauthorized", 401);

    const body = await req.json();
    const validated = ProfileSchema.parse(body);
    return ProfileService.create(token.sub, validated);
  }, 201);
}

export async function PUT(req: NextRequest) {
  return apiWrapper(async () => {
    const token = await getToken({ req });
    if (!token?.sub) throw new AppError("UNAUTHORIZED", "Unauthorized", 401);

    const body = await req.json();
    const validated = ProfileSchema.partial().parse(body);
    return ProfileService.update(token.sub, validated);
  });
}

export async function DELETE(req: NextRequest) {
  return apiWrapper(async () => {
    const token = await getToken({ req });
    if (!token?.sub) throw new AppError("UNAUTHORIZED", "Unauthorized", 401);

    return ProfileService.delete(token.sub);
  });
}

