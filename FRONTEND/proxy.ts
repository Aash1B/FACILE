import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("facile_token")?.value;
  const { pathname } = request.nextUrl;

  // Paths that require authentication
  const protectedPaths = ["/profile", "/checkout", "/account"];
  
  const isProtected = protectedPaths.some((path) => 
    pathname === path || pathname.startsWith(path + "/")
  );

  if (isProtected && !token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // If user is authenticated, prevent visiting login/register pages
  const authPaths = ["/login", "/register", "/forgot-password", "/verify-email"];
  const isAuthPath = authPaths.some((path) => pathname === path);

  if (isAuthPath && token) {
    const url = request.nextUrl.clone();
    url.pathname = "/profile";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Config to specify matching paths
export const config = {
  matcher: [
    "/profile/:path*",
    "/checkout/:path*",
    "/account/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/verify-email",
  ],
};
