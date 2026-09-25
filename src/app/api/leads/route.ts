import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Lead } from "@/models";
import { rateLimit } from "@/lib/rate-limit";
import { notifyNewLead } from "@/lib/email";
import { calculateQuote } from "@/lib/pricing";
import { getSettings } from "@/lib/settings";
import { Board } from "@/models";

const schema = z.object({
  source: z.enum(["QUOTE", "CONTACT"]),
  name: z.string().min(2).max(120),
  phone: z.string().min(7).max(30),
  cityInterested: z.string().min(2).max(80),
  boardId: z.string().optional().nullable(),
  months: z.number().int().min(1).max(36).optional(),
  notes: z.string().max(2000).optional(),
  website: z.string().optional(), // honeypot
});

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "anon";
  const limited = rateLimit(`lead:${ip}`, 5, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const data = schema.parse(body);

    if (data.website && data.website.trim().length > 0) {
      return NextResponse.json({ ok: true });
    }

    await connectDB();

    let quoteTotal: number | null = null;
    let quoteMonths: number | null = null;

    if (data.source === "QUOTE" && data.boardId && data.months) {
      const board = await Board.findById(data.boardId).lean();
      if (!board) {
        return NextResponse.json({ error: "Board not found" }, { status: 404 });
      }
      const settings = await getSettings();
      const quote = calculateQuote({
        boardId: String(board._id),
        months: data.months,
        pricePerMonth: board.pricePerMonth,
        boardType: board.type as "STATIC" | "DIGITAL",
        designFee: settings.designFee,
        currency: settings.currency,
        durationMultipliers: settings.durationMultipliers,
        typeMultipliers: settings.typeMultipliers,
      });
      quoteTotal = quote.total;
      quoteMonths = quote.months;
    }

    const lead = await Lead.create({
      source: data.source,
      name: data.name,
      phone: data.phone,
      cityInterested: data.cityInterested,
      boardId: data.boardId || null,
      notes: data.notes || "",
      quoteTotal,
      quoteMonths,
      status: "NEW",
    });

    await notifyNewLead({
      name: lead.name,
      phone: lead.phone,
      cityInterested: lead.cityInterested,
      source: lead.source,
      boardId: lead.boardId ? String(lead.boardId) : null,
      quoteTotal,
      quoteMonths,
    });

    return NextResponse.json({ ok: true, id: String(lead._id) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
