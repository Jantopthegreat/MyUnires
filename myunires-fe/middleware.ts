import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value || 
                request.headers.get("authorization")?.replace("Bearer ", "");
  
  const { pathname } = request.nextUrl;

  // Public routes - tidak perlu login
  const publicPaths = ["/login", "/", "/api"];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // Jika belum login dan mencoba akses protected route
  if (!token && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Jika sudah login dan mencoba akses login page, redirect ke dashboard
  if (token && pathname === "/login") {
    // Ambil user dari localStorage (di client) atau decode JWT (di server)
    // Untuk simplicity, redirect ke default dashboard
    const dashboardUrl = new URL("/pembina/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg).*)",
  ],
};
