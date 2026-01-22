"use server";

import { revalidatePath } from "next/cache";
import { ProfileService } from "@/services/profile-service";
import { ProfileSchema } from "@/core/validation/profile";
import { protectedAction } from "@/lib/action-utils";
import { z } from "zod";

/** Update Profile Action */
export async function updateProfileAction(data: any) {
    return protectedAction(data, ProfileSchema.partial(), async (validatedData) => {
        const { _id, ...rest } = data;
        const result = await ProfileService.update(_id, rest);
        revalidatePath("/");
        revalidatePath("/dashboard");
        return result;
    });
}

/** Create Profile Action */
export async function createProfileAction(data: any) {
    return protectedAction(data, ProfileSchema, async (validatedData, session) => {
        // Use session user id if we want to tie profile to user
        const result = await ProfileService.create(session.user.id, validatedData as any);
        revalidatePath("/");
        revalidatePath("/dashboard");
        return result;
    });
}

/** Delete Profile Action */
export async function deleteProfileAction(id: string) {
    return protectedAction({ id }, z.object({ id: z.string() }), async ({ id: profileId }) => {
        const result = await ProfileService.delete(profileId);
        revalidatePath("/");
        revalidatePath("/dashboard");
        return result;
    });
}
