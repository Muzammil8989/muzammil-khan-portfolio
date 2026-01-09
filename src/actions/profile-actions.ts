"use server";

import { revalidatePath } from "next/cache";
import { ProfileService } from "@/services/profile-service";
import { ProfileSchema } from "@/core/validation/profile";
import { protectedAction } from "@/lib/action-utils";

/** Update Profile Action */
export async function updateProfileAction(data: any) {
    return protectedAction(data, ProfileSchema.partial(), async (validatedData, session) => {
        // Assuming profile is linked to user id from session
        const result = await ProfileService.update(session.user.id, validatedData);
        revalidatePath("/");
        revalidatePath("/dashboard");
        return result;
    });
}

/** Create Profile Action */
export async function createProfileAction(data: any) {
    return protectedAction(data, ProfileSchema, async (validatedData, session) => {
        const result = await ProfileService.create(session.user.id, validatedData);
        revalidatePath("/");
        revalidatePath("/dashboard");
        return result;
    });
}
