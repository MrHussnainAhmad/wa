import { NextResponse } from "next/server";
import { addDays, differenceInCalendarDays, format } from "date-fns";
import { connectDB } from "@/lib/db";
import { assertCronAuthorized } from "@/lib/cron-auth";
import { Booking } from "@/models";
import { sendBookingDigest } from "@/lib/email";

/** Legacy endpoint — prefer /api/cron/daily-ops */
export async function GET(req: Request) {
  const denied = assertCronAuthorized(req);
  if (denied) return denied;

  await connectDB();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const until = addDays(today, 14);

  const bookings = await Booking.find({
    endDate: { $gte: today, $lte: until },
  })
    .populate("boardId")
    .lean();

  const rows = bookings.map((b) => {
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

  await sendBookingDigest(rows);

  return NextResponse.json({ ok: true, count: rows.length });
}
