import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ Skip untuk API, assets, Next internals, dan public files
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/images") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // ✅ Halaman publik (bisa diakses tanpa login)
  const publicRoutes = ["/", "/login", "/register"];
  if (publicRoutes.includes(pathname)) {
    if (token) {
      // Sudah login → arahkan sesuai role
      if (token.role === "ADMIN")
        return NextResponse.redirect(new URL("/dashboard/admin", req.url));
      if (token.role === "OWNER")
        return NextResponse.redirect(new URL("/dashboard/owner", req.url));
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // ✅ Proteksi halaman dashboard
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // 🔹 ADMIN access
    if (pathname.startsWith("/dashboard/admin") && token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // 🔹 OWNER access
    if (pathname.startsWith("/dashboard/owner") && token.role !== "OWNER") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // 🔹 USER access restriction
    if (
      token.role === "USER" &&
      (pathname.startsWith("/dashboard/admin") ||
        pathname.startsWith("/dashboard/owner"))
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // 🔹 Redirect otomatis ke dashboard role masing-masing kalau buka root
    if (pathname === "/dashboard" || pathname === "/dashboard/") {
      if (token.role === "ADMIN")
        return NextResponse.redirect(new URL("/dashboard/admin", req.url));
      if (token.role === "OWNER")
        return NextResponse.redirect(new URL("/dashboard/owner", req.url));
    }
  }

  // ✅ Default: lanjut
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next|static|images|.*\\..*).*)", // <- amanin semua API & static path
  ],
};
