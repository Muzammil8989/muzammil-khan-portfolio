"use server";

import { revalidatePath } from "next/cache";
import { WorkService } from "@/services/work-service";
import { WorkExperienceSchema } from "@/core/validation/work";
import { protectedAction } from "@/lib/action-utils";
import { z } from "zod";

/** Create Work Action */
export async function createWorkAction(data: any) {
    return protectedAction(data, WorkExperienceSchema, async (validatedData) => {
        const result = await WorkService.create(validatedData);
        revalidatePath("/");
        revalidatePath("/dashboard");
        return result;
    });
}

/** Update Work Action */
export async function updateWorkAction(id: string, data: any) {
    return protectedAction(data, WorkExperienceSchema.partial(), async (validatedData) => {
        const result = await WorkService.update(id, validatedData);
        revalidatePath("/");
        revalidatePath("/dashboard");
        return result;
    });
}

/** Delete Work Action */
export async function deleteWorkAction(id: string) {
    return protectedAction({}, z.any(), async () => {
        const result = await WorkService.delete(id);
        revalidatePath("/");
        revalidatePath("/dashboard");
        return result;
    });
}
