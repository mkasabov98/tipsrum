import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Optimistic gate for protected pages: it only checks that a session cookie exists,
 * without touching the database. Every protected page still verifies the session
 * itself via getSession() - this just skips rendering for obvious guests.
 *
 * Deliberately does NOT bounce signed-in users away from /login: a stale cookie
 * would pass this check while the page's real check fails, looping between
 * /my_account and /login.
 */
export function proxy(request: NextRequest) {
  if (getSessionCookie(request)) return NextResponse.next();

  const { pathname, search } = request.nextUrl;
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirect", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/my_account/:path*"],
};
