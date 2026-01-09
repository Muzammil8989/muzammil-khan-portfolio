"use server";

import { revalidatePath } from "next/cache";
import { AboutService } from "@/services/about-service";
import { AboutSchema } from "@/core/validation/about";
import { protectedAction } from "@/lib/action-utils";
import { z } from "zod";

/** Upsert About Action */
export async function upsertAboutAction(data: any) {
    return protectedAction(data, AboutSchema, async (validatedData) => {
        const result = await AboutService.upsert(validatedData);
        revalidatePath("/");
        revalidatePath("/dashboard");
        return result;
    });
}

/** Delete About Action */
export async function deleteAboutAction() {
    return protectedAction({}, z.any(), async () => {
        const result = await AboutService.delete();
        revalidatePath("/");
        revalidatePath("/dashboard");
        return result;
    });
}
