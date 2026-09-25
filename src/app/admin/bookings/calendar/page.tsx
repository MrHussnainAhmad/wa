import Link from "next/link";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  parse,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { connectDB } from "@/lib/db";
import { Booking } from "@/models";

export const dynamic = "force-dynamic";

function monthKey(d: Date) {
  return format(d, "yyyy-MM");
}

export default async function BookingCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month: monthParam } = await searchParams;
  const base = monthParam
    ? parse(`${monthParam}-01`, "yyyy-MM-dd", new Date())
    : new Date();
  const monthStart = startOfMonth(base);
  const monthEnd = endOfMonth(base);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const prev = monthKey(addMonths(monthStart, -1));
  const next = monthKey(addMonths(monthStart, 1));
  const today = new Date();

  await connectDB();
  const bookings = await Booking.find({
    startDate: { $lte: monthEnd },
    endDate: { $gte: monthStart },
  })
    .populate("boardId")
    .sort({ startDate: 1 })
    .lean();

  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-white">
          Calendar
        </h1>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/bookings/calendar?month=${prev}`}
            className="border border-stone-700 px-3 py-1.5 text-sm text-stone-300 hover:border-amber-500/50"
          >
            ←
          </Link>
          <span className="min-w-[8.5rem] text-center font-[family-name:var(--font-display)] text-2xl text-amber-400">
            {format(monthStart, "MMMM yyyy")}
          </span>
          <Link
            href={`/admin/bookings/calendar?month=${next}`}
            className="border border-stone-700 px-3 py-1.5 text-sm text-stone-300 hover:border-amber-500/50"
          >
            →
          </Link>
        </div>
      </div>

      <div className="border border-stone-800">
        <div className="grid grid-cols-7 border-b border-stone-800 bg-stone-900/60">
          {weekdays.map((d) => (
            <div
              key={d}
              className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wider text-stone-500"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const inMonth = isSameMonth(day, monthStart);
            const isToday = isSameDay(day, today);
            const dayBookings = bookings.filter((b) =>
              isWithinInterval(day, {
                start: new Date(b.startDate),
                end: new Date(b.endDate),
              })
            );

            return (
              <div
                key={day.toISOString()}
                className={`min-h-[5.5rem] border-b border-r border-stone-800 p-1.5 ${
                  inMonth ? "bg-stone-950" : "bg-stone-950/40"
                }`}
              >
                <p
                  className={`mb-1 text-xs ${
                    isToday
                      ? "inline-flex size-5 items-center justify-center bg-amber-500 font-semibold text-stone-950"
                      : inMonth
                        ? "text-stone-300"
                        : "text-stone-600"
                  }`}
                >
                  {format(day, "d")}
                </p>
                <ul className="space-y-0.5">
                  {dayBookings.slice(0, 3).map((b) => {
                    const board = b.boardId as unknown as {
                      city?: string;
                    } | null;
                    return (
                      <li
                        key={String(b._id)}
                        className="truncate bg-amber-500/20 px-1 py-0.5 text-[10px] leading-tight text-amber-200"
                        title={`${b.clientName}${board?.city ? ` · ${board.city}` : ""}`}
                      >
                        {b.clientName}
                        {board?.city ? ` · ${board.city}` : ""}
                      </li>
                    );
                  })}
                  {dayBookings.length > 3 ? (
                    <li className="px-1 text-[10px] text-stone-500">
                      +{dayBookings.length - 3} more
                    </li>
                  ) : null}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-stone-500">
        Amber chips = active bookings that day. Use Bookings list for full details.
      </p>
    </div>
  );
}
