// src/core/errors/AppError.ts
export type ErrorCode =
    | "UNAUTHORIZED"
    | "FORBIDDEN"
    | "BAD_REQUEST"
    | "NOT_FOUND"
    | "INTERNAL_SERVER_ERROR"
    | "VALIDATION_ERROR";

export class AppError extends Error {
    constructor(
        public readonly code: ErrorCode,
        public readonly message: string,
        public readonly status: number = 500,
        public readonly details?: any
    ) {
        super(message);
        this.name = "AppError";
    }
}

export type ApiResponse<T> = {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
        traceId?: string;
    };
};
