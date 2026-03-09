import { NextRequest } from "next/server";
import { apiWrapper } from "@/lib/api-utils";
import { BlogService } from "@/services/blog-service";
import { AppError } from "@/core/errors/AppError";
import { checkRateLimit } from "@/lib/rate-limit";

// Validate that a string looks like a valid IPv4 or IPv6 address
const IPV4_RE = /^(\d{1,3}\.){3}\d{1,3}$/;
const IPV6_RE = /^[0-9a-fA-F:]{2,39}$/;

function sanitizeIp(raw: string): string {
  const candidate = raw.trim();
  if (IPV4_RE.test(candidate) || IPV6_RE.test(candidate)) return candidate;
  return "anonymous";
}

export async function POST(
  request: NextRequest,
  context: any
) {
  return apiWrapper(async () => {
    const { id } = await context.params;

    // Extract and validate IP (last trusted hop from x-forwarded-for)
    const forwarded = request.headers.get("x-forwarded-for");
    const rawIp = forwarded ? forwarded.split(",")[0] : request.nextUrl.hostname || "anonymous";
    const ip = sanitizeIp(rawIp);

    // Rate limit: 10 like attempts per minute per IP
    if (!checkRateLimit(`like:${ip}`, 10, 60 * 1000)) {
      throw new AppError("TOO_MANY_REQUESTS", "Too many requests. Please slow down.", 429);
    }

    const blog = await BlogService.incrementLikes(id, ip);
    return blog;
  });
}
