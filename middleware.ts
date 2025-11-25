import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Halaman publik
  const publicRoutes = ["/", "/login", "/register", "/forgot-password"];

  // Skip static files & API
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Token user
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // PUBLIC ROUTES
  if (publicRoutes.includes(pathname)) {
    if (!token) return NextResponse.next();

    // Sudah login -> redirect berdasarkan role
    if (token.role === "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard/admin", request.url));
    }

    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // PROTECTED ROUTES
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // ADMIN ONLY
    if (pathname.startsWith("/dashboard/admin") && token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

// ACTIVE MIDDLEWARE
export const config = {
  matcher: ["/((?!api|_next|static|.*\\..*).*)"],
};
