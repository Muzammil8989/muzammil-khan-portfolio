"use server";

import { revalidatePath } from "next/cache";
import { SkillService } from "@/services/skill-service";
import { protectedAction } from "@/lib/action-utils";
import { z } from "zod";

export async function updateSkillsAction(skills: string[]) {
    return protectedAction({ skills }, z.object({ skills: z.array(z.string()) }), async (data) => {
        const result = await SkillService.updateMany(data.skills);
        revalidatePath("/");
        revalidatePath("/dashboard");
        return result;
    });
}
