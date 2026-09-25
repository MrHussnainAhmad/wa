import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Board } from "@/models";
import { getSettings } from "@/lib/settings";
import { calculateQuote } from "@/lib/pricing";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  boardId: z.string().min(1),
  months: z.number().int().min(1).max(36),
});

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "anon";
  const limited = rateLimit(`quote:${ip}`, 30, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const data = schema.parse(body);

    await connectDB();
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

    return NextResponse.json({ quote });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
