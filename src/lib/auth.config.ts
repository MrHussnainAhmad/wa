import type { NextAuthConfig } from "next-auth";
import type { AdminRole } from "@/types";

/**
 * Edge-safe auth config (no mongoose/bcrypt).
 * Used by middleware. Full providers live in auth.ts.
 */
export const authConfig = {
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt" as const },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const path = request.nextUrl.pathname;
      if (!path.startsWith("/admin")) return true;
      return Boolean(auth?.user?.email || auth?.user?.id);
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.sub = user.id;
        token.role = user.role as AdminRole | undefined;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id || token.sub || "");
        session.user.role = (token.role as AdminRole) || "SALES_REP";
        if (token.email) session.user.email = String(token.email);
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
