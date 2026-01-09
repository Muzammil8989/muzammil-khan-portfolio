// src/lib/action-utils.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AppError } from "@/core/errors/AppError";
import { z } from "zod";

export type ActionState<T> = {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
};

export async function protectedAction<TInput, TOutput>(
    data: any,
    schema: z.ZodSchema<TInput>,
    handler: (data: TInput, session: any) => Promise<TOutput>
): Promise<ActionState<TOutput>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            throw new AppError("UNAUTHORIZED", "You must be logged in to perform this action", 401);
        }

        // Validation
        const validatedData = schema.parse(data);

        return {
            success: true,
            data: await handler(validatedData, session),
        };
    } catch (error: any) {
        console.error("Action Error:", error);
        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid input data",
                    details: error.flatten().fieldErrors,
                },
            };
        }
        if (error instanceof AppError) {
            return {
                success: false,
                error: {
                    code: error.code,
                    message: error.message,
                },
            };
        }
        return {
            success: false,
            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "An unexpected error occurred",
            },
        };
    }
}
