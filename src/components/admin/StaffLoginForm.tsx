"use client";

import { signIn } from "next-auth/react";
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
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);

    const res = await signIn("credentials", {
      email: String(form.get("email") || ""),
      password: String(form.get("password") || ""),
      portal: allowedRole === "SUPER_ADMIN" ? "admin" : "sales",
      redirect: false,
    });

    if (res?.error) {
      setLoading(false);
      if (allowedRole === "SUPER_ADMIN") {
        setError(
          "Login failed. Use admin credentials here, or sales staff use /login."
        );
      } else {
        setError(
          "Login failed. Use sales credentials here, or admins use /login/admin."
        );
      }
      return;
    }

    const callback = params.get("callbackUrl") || "/admin";
    router.push(callback);
    router.refresh();
    setLoading(false);
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
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            className="pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center justify-center p-1.5 text-stone-400 hover:text-amber-400"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 3l18 18M10.6 10.7a2 2 0 002.8 2.8M9.9 5.1A10.5 10.5 0 0121 12c-.7 1.2-1.6 2.3-2.6 3.2M6.1 6.1C4.5 7.4 3.2 9.1 2.3 12c1.8 5 6.2 8 9.7 8 1.5 0 3-.4 4.3-1.1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M2.3 12C4.1 7 8.5 4 12 4s7.9 3 9.7 8c-1.8 5-6.2 8-9.7 8s-7.9-3-9.7-8z" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
