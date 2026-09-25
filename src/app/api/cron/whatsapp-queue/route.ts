import { NextResponse } from "next/server";
import { processWhatsAppOutbox } from "@/lib/whatsapp";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(req: Request) {
  const secret = req.headers.get("x-cron-secret");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processWhatsAppOutbox();
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Queue failed";
    console.error("[cron:whatsapp-queue]", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
