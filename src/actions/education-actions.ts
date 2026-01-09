"use server";

import { revalidatePath } from "next/cache";
import { EducationService } from "@/services/education-service";
import { EducationSchema } from "@/core/validation/education";
import { protectedAction } from "@/lib/action-utils";
import { z } from "zod";

/** Create Education Action */
export async function createEducationAction(data: any) {
    return protectedAction(data, EducationSchema, async (validatedData) => {
        const result = await EducationService.create(validatedData);
        revalidatePath("/");
        revalidatePath("/dashboard");
        return result;
    });
}

/** Update Education Action */
export async function updateEducationAction(id: string, data: any) {
    return protectedAction(data, EducationSchema.partial(), async (validatedData) => {
        const result = await EducationService.update(id, validatedData);
        revalidatePath("/");
        revalidatePath("/dashboard");
        return result;
    });
}

/** Delete Education Action */
export async function deleteEducationAction(id: string) {
    return protectedAction({}, z.any(), async () => {
        const result = await EducationService.delete(id);
        revalidatePath("/");
        revalidatePath("/dashboard");
        return result;
    });
}
