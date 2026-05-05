import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getOwnerEmailEnv, normalizeEmail } from "@/lib/access";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const path = req.nextUrl.pathname;
  const isAuthPage = path === "/login" || path === "/register";

  if (!isLoggedIn && !isAuthPage) {
    const url = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(url);
  }
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }

  const ownerEmail = getOwnerEmailEnv();
  const userEmail = normalizeEmail(req.auth?.user?.email ?? undefined);
  const isOwner = !ownerEmail || Boolean(userEmail && userEmail === ownerEmail);

  if (isLoggedIn && !isOwner) {
    const clientForbidden =
      path === "/" ||
      path.startsWith("/clients") ||
      path.startsWith("/entries") ||
      path === "/quotes/new";
    if (clientForbidden) {
      return NextResponse.redirect(new URL("/quotes", req.nextUrl.origin));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api/|_next/static|_next/image|favicon.ico).*)"],
};
