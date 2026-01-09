import { NextRequest } from "next/server";
import { SkillService } from "@/services/skill-service";
import { apiWrapper } from "@/lib/api-utils";
import { getToken } from "next-auth/jwt";
import { AppError } from "@/core/errors/AppError";
import { z } from "zod";

export async function GET() {
    return apiWrapper(() => SkillService.getSkillsList());
}

export async function POST(req: NextRequest) {
    return apiWrapper(async () => {
        const token = await getToken({ req });
        if (!token) throw new AppError("UNAUTHORIZED", "Unauthorized", 401);

        const body = await req.json();
        const validated = z.array(z.string()).parse(body.skills);
        return SkillService.updateMany(validated);
    });
}
