// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isApiRoute = request.nextUrl.pathname.startsWith("/api");
  const isAuthRoute = request.nextUrl.pathname.startsWith("/signin");
  const isDashboardRoute = request.nextUrl.pathname.startsWith("/dashboard");

  // 1. Redirect to dashboard if logged in and trying to access signin
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 2. Protect UI Dashboard
  if (isDashboardRoute && !token) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  // 3. Protect sensitive API routes (exclude public ones)
  const publicApiRoutes = ["/api/auth", "/api/work", "/api/about", "/api/profile"]; // Assuming GET is public, but we need caution
  // Ideally, we restrict non-GET methods in middleware if possible, 
  // but simpler to check in route or custom admin path

  if (isApiRoute && !token) {
    // Certain API routes should always be protected regardless of method
    const strictlyProtected = ["/api/upload", "/api/test-connection"];
    if (strictlyProtected.some(p => request.nextUrl.pathname.startsWith(p))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/signin", "/api/:path*"],
};

