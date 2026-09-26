import { NextResponse } from "next/server";
import { addDays, differenceInCalendarDays, format, subHours } from "date-fns";
import { connectDB } from "@/lib/db";
import { assertCronAuthorized } from "@/lib/cron-auth";
import { Board, Booking, Lead } from "@/models";
import { syncBoardAvailability } from "@/lib/availability";
import { sendDailyOpsDigest } from "@/lib/email";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(req: Request) {
  const denied = assertCronAuthorized(req);
  if (denied) return denied;

  try {
    await connectDB();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const until = addDays(today, 14);
    const since24h = subHours(new Date(), 24);
    const olderThan48h = subHours(new Date(), 48);

    const boards = await Board.find().select("_id").lean();
    for (const b of boards) {
      await syncBoardAvailability(b._id);
    }

    const [endingBookings, newLeads, staleLeads] = await Promise.all([
      Booking.find({ endDate: { $gte: today, $lte: until } })
        .populate("boardId")
        .sort({ endDate: 1 })
        .lean(),
      Lead.find({ createdAt: { $gte: since24h } })
        .sort({ createdAt: -1 })
        .lean(),
      Lead.find({ status: "NEW", createdAt: { $lte: olderThan48h } })
        .sort({ createdAt: 1 })
        .lean(),
    ]);

    const endingSoon = endingBookings.map((b) => {
      const board = b.boardId as unknown as {
        city?: string;
        address?: string;
      } | null;
      return {
        boardLabel: board
          ? `${board.city} — ${board.address}`
          : String(b.boardId),
        clientName: b.clientName,
        endDate: format(new Date(b.endDate), "yyyy-MM-dd"),
        daysLeft: differenceInCalendarDays(new Date(b.endDate), today),
      };
    });

    let emailOk = true;
    let emailError: string | null = null;
    try {
      await sendDailyOpsDigest({
        endingSoon,
        newLeads: newLeads.map((l) => ({
          name: l.name,
          phone: l.phone,
          city: l.cityInterested,
          source: l.source,
        })),
        staleLeads: staleLeads.map((l) => ({
          name: l.name,
          phone: l.phone,
          city: l.cityInterested,
          ageHours: Math.max(
            48,
            Math.round(
              (Date.now() - new Date(l.createdAt).getTime()) / (1000 * 60 * 60)
            )
          ),
        })),
        boardsSynced: boards.length,
      });
    } catch (e) {
      emailOk = false;
      emailError = e instanceof Error ? e.message : "Email failed";
      console.error("[cron:daily-ops:email]", emailError);
    }

    return NextResponse.json({
      ok: true,
      boardsSynced: boards.length,
      endingSoon: endingSoon.length,
      newLeads: newLeads.length,
      staleLeads: staleLeads.length,
      emailOk,
      emailError,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Cron failed";
    console.error("[cron:daily-ops]", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
