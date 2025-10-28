import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const path = url.pathname;

  if (path.startsWith("/dashboard") || path.startsWith("/admin")) {
    const token =
      req.cookies.get("sb-access-token") ?? req.cookies.get("sb:token");
    if (!token) {
      url.pathname = "/auth";
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*", "/admin/:path*"] };
