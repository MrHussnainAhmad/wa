"use client";

import { getSession, signIn, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import type { AdminRole } from "@/types";

export function StaffLoginForm({
  allowedRole,
  title,
}: {
  allowedRole: AdminRole;
  title: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });

    if (res?.error) {
      setLoading(false);
      setError("Invalid email or password");
      return;
    }

    const session = await getSession();
    const role = session?.user?.role;

    if (role !== allowedRole) {
      await signOut({ redirect: false });
      setLoading(false);
      if (allowedRole === "SUPER_ADMIN") {
        setError("Admin login only. Sales staff should use /login");
      } else {
        setError("Sales login only. Admins should use /login/admin");
      }
      return;
    }

    setLoading(false);
    router.push(params.get("callbackUrl") || "/admin");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-sm space-y-4">
      <p className="text-center text-sm text-stone-400">{title}</p>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
