import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { assertCronAuthorized } from "@/lib/cron-auth";
import mongoose from "mongoose";

export const runtime = "nodejs";
export const maxDuration = 15;
export const dynamic = "force-dynamic";

/**
 * Lightweight keep-alive so Atlas free/shared clusters
 * do not pause from inactivity.
 */
export async function GET(req: Request) {
  const denied = assertCronAuthorized(req);
  if (denied) return denied;

  try {
    await connectDB();
    const started = Date.now();
    const result = await mongoose.connection.db?.admin().command({ ping: 1 });
    const ms = Date.now() - started;

    return NextResponse.json({
      ok: true,
      ping: result?.ok === 1,
      ms,
      at: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ping failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
