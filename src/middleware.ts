/**
 * Middleware - Infrastructure Layer
 * Protects routes and handles authentication
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/auth/signin", "/auth/register", "/auth/error"];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Check for session token in cookies (database sessions)
  const sessionToken =
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value;

  // If user is not authenticated and trying to access protected route
  if (!sessionToken && !isPublicRoute) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  // If user is authenticated and trying to access auth pages, redirect to chat
  if (
    sessionToken &&
    (pathname === "/auth/signin" ||
      pathname === "/auth/register" ||
      pathname === "/auth/error")
  ) {
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  // If user is authenticated and on home page, redirect to chat
  if (sessionToken && pathname === "/") {
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes) - including NextAuth API routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - _next/webpack-hmr (hot reload)
     */
    "/((?!api|_next/static|_next/image|_next/webpack-hmr|favicon.ico).*)",
  ],
};
