import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { AdminUser } from "@/models";
import { authConfig } from "@/lib/auth.config";
import type { AdminRole } from "@/types";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        portal: { label: "Portal", type: "text" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "")
          .toLowerCase()
          .trim();
        const password = String(credentials?.password ?? "");
        const portal = String(credentials?.portal ?? "sales");

        if (!email || !password) return null;

        await connectDB();
        const user = await AdminUser.findOne({ email });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        const role = user.role as AdminRole;

        // Admin portal: SUPER_ADMIN only
        if (portal === "admin" && role !== "SUPER_ADMIN") return null;
        // Sales portal: sales + admin (middleware may bounce admins here)
        if (
          portal === "sales" &&
          role !== "SALES_REP" &&
          role !== "SUPER_ADMIN"
        ) {
          return null;
        }

        return {
          id: String(user._id),
          email: user.email,
          name: user.name || user.email,
          role,
        };
      },
    }),
  ],
});

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function requireSuperAdmin() {
  const session = await requireAdmin();
  if (session.user.role !== "SUPER_ADMIN") {
    throw new Error("FORBIDDEN");
  }
  return session;
}
