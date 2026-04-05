import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE } from "@/lib/server-auth";

const publicRoutes = new Set(["/login", "/signup", "/forgot-password", "/reset-password"]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const isPublicProfileRoute = /^\/profile\/[^/]+$/.test(pathname);
  const isPublicRoute = publicRoutes.has(pathname) || isPublicProfileRoute;

  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (token || isPublicRoute) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
