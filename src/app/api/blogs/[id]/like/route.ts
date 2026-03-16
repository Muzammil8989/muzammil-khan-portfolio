import { NextRequest } from "next/server";
import { apiWrapper } from "@/lib/api-utils";
import { BlogService } from "@/services/blog-service";
import { AppError } from "@/core/errors/AppError";
import { checkRateLimit } from "@/lib/rate-limit";
import { isValidUUID } from "@/lib/like-token";

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

    // Extract IP for rate-limiting (still IP-based to prevent abuse)
    const forwarded = request.headers.get("x-forwarded-for");
    const rawIp = forwarded ? forwarded.split(",")[0] : request.nextUrl.hostname || "anonymous";
    const ip = sanitizeIp(rawIp);

    // Rate limit: 10 attempts per minute per IP
    if (!checkRateLimit(`like:${ip}`, 10, 60 * 1000)) {
      throw new AppError("TOO_MANY_REQUESTS", "Too many requests. Please slow down.", 429);
    }

    // Prefer the browser UUID token for deduplication — this allows multiple
    // users on the same network (same IP) to each like independently.
    // Fall back to IP if the header is missing or invalid.
    const likeToken = request.headers.get("x-like-token")?.trim() ?? "";
    const identifier = isValidUUID(likeToken) ? likeToken : ip;

    const blog = await BlogService.incrementLikes(id, identifier);
    return blog;
  });
}
