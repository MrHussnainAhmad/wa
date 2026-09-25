import type { AdminRole } from "@/types";

declare module "next-auth" {
  interface User {
    role?: AdminRole;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: AdminRole;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: AdminRole;
  }
}

export {};
