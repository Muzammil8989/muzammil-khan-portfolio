// src/lib/api-utils.ts
import { NextResponse } from "next/server";
import { AppError } from "@/core/errors/AppError";
import { z } from "zod";

export async function apiWrapper<T>(
    handler: () => Promise<T>,
    status = 200
) {
    try {
        const data = await handler();
        return NextResponse.json(
            { success: true, data },
            { status }
        );
    } catch (error: any) {
        console.error("API Error:", error);

        if (error instanceof AppError) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: error.code, message: error.message, details: error.details }
                },
                { status: error.status }
            );
        }

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: "VALIDATION_ERROR", message: "Invalid data", details: error.flatten().fieldErrors }
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: { code: "INTERNAL_SERVER_ERROR", message: "An unexpected error occurred" }
            },
            { status: 500 }
        );
    }
}
