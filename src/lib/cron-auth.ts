import { NextResponse } from "next/server";

/** Accept Vercel Cron (Bearer) or manual x-cron-secret header. */
export function assertCronAuthorized(req: Request): NextResponse | null {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured" },
      { status: 500 }
    );
  }

  const bearer = req.headers.get("authorization");
  const headerSecret = req.headers.get("x-cron-secret");
  const ok =
    headerSecret === expected ||
    bearer === `Bearer ${expected}`;

  if (!ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
