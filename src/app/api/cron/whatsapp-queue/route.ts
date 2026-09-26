import { NextResponse } from "next/server";
import { processWhatsAppOutbox } from "@/lib/whatsapp";
import { assertCronAuthorized } from "@/lib/cron-auth";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(req: Request) {
  const denied = assertCronAuthorized(req);
  if (denied) return denied;

  try {
    const result = await processWhatsAppOutbox();
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Queue failed";
    console.error("[cron:whatsapp-queue]", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
