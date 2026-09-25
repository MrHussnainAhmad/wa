import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const user = req.auth?.user;
  const isLoggedIn = Boolean(user?.email || user?.id);

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    const isSuperRoute =
      pathname.startsWith("/admin/settings") ||
      pathname.startsWith("/admin/users");
    const url = new URL(
      isSuperRoute ? "/login/admin" : "/login",
      req.nextUrl.origin
    );
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (
    (pathname.startsWith("/admin/settings") ||
      pathname.startsWith("/admin/users")) &&
    user?.role !== "SUPER_ADMIN"
  ) {
    return NextResponse.redirect(new URL("/admin", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
