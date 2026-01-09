"use server";

import { revalidatePath } from "next/cache";
import { ProjectService } from "@/services/project-service";
import { ProjectSchema } from "@/core/validation/project";
import { protectedAction } from "@/lib/action-utils";
import { z } from "zod";

/** Create Project Action */
export async function createProjectAction(data: any) {
    return protectedAction(data, ProjectSchema, async (validatedData) => {
        const result = await ProjectService.create(validatedData);
        revalidatePath("/");
        revalidatePath("/dashboard");
        return result;
    });
}

/** Update Project Action */
export async function updateProjectAction(id: string, data: any) {
    return protectedAction(data, ProjectSchema.partial(), async (validatedData) => {
        const result = await ProjectService.update(id, validatedData);
        revalidatePath("/");
        revalidatePath("/dashboard");
        return result;
    });
}

/** Delete Project Action */
export async function deleteProjectAction(id: string) {
    // We don't really need protectedAction if we don't have a body to validate, 
    // but for consistency we can use it with an empty object and z.any()
    return protectedAction({}, z.any(), async () => {
        const result = await ProjectService.delete(id);
        revalidatePath("/");
        revalidatePath("/dashboard");
        return result;
    });
}
