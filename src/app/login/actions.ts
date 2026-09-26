"use server";

import { AuthError } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { signIn } from "@/lib/auth";
import { connectDB } from "@/lib/db";

export type LoginState = { error?: string } | null;

export async function staffLogin(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") || "")
    .toLowerCase()
    .trim();
  const password = String(formData.get("password") || "");
  const portal = String(formData.get("portal") || "sales");
  const callbackUrl = String(formData.get("callbackUrl") || "/admin");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  try {
    // Warm Mongo before Auth.js authorize (same isolate → reused)
    await connectDB();
    await signIn("credentials", {
      email,
      password,
      portal,
      redirectTo: callbackUrl.startsWith("/") ? callbackUrl : "/admin",
    });
    return null;
  } catch (error) {
    // Successful sign-in throws a redirect — must rethrow
    if (isRedirectError(error)) throw error;

    if (error instanceof AuthError) {
      return {
        error:
          portal === "admin"
            ? "Login failed. Use admin credentials, or sales staff use /login."
            : "Login failed. Check email/password.",
      };
    }

    throw error;
  }
}
