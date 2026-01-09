import { NextRequest } from "next/server";
import { ProjectService } from "@/services/project-service";
import { apiWrapper } from "@/lib/api-utils";
import { ProjectSchema } from "@/core/validation/project";
import { getToken } from "next-auth/jwt";
import { AppError } from "@/core/errors/AppError";

export async function GET() {
    return apiWrapper(() => ProjectService.getAll());
}

export async function POST(req: NextRequest) {
    return apiWrapper(async () => {
        const token = await getToken({ req });
        if (!token) throw new AppError("UNAUTHORIZED", "Unauthorized", 401);

        const body = await req.json();
        const validated = ProjectSchema.parse(body);
        return ProjectService.create(validated);
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
        const validated = ProjectSchema.partial().parse(body);
        return ProjectService.update(id, validated);
    });
}

export async function DELETE(req: NextRequest) {
    return apiWrapper(async () => {
        const token = await getToken({ req });
        if (!token) throw new AppError("UNAUTHORIZED", "Unauthorized", 401);

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) throw new AppError("BAD_REQUEST", "Missing id", 400);

        return ProjectService.delete(id);
    });
}
