import Link from "next/link";
import { differenceInCalendarDays } from "date-fns";
import { connectDB } from "@/lib/db";
import { Booking } from "@/models";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { formatMoney } from "@/lib/utils";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  await connectDB();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [bookings, settings] = await Promise.all([
    Booking.find().populate("boardId").sort({ endDate: 1 }).lean(),
    getSettings(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-white">
          Bookings
        </h1>
        <div className="flex gap-2">
          <Link href="/admin/bookings/calendar">
            <Button variant="secondary">Calendar</Button>
          </Link>
          <Link href="/admin/bookings/new">
            <Button>New booking</Button>
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto border border-stone-800">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-stone-900 text-stone-400">
            <tr>
              <th className="px-3 py-2">Board</th>
              <th className="px-3 py-2">Client</th>
              <th className="px-3 py-2">Dates</th>
              <th className="px-3 py-2">Deposit</th>
              <th className="px-3 py-2">Price</th>
              <th className="px-3 py-2">Alert</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => {
              const board = b.boardId as unknown as {
                city?: string;
                address?: string;
              } | null;
              const daysLeft = differenceInCalendarDays(
                new Date(b.endDate),
                today
              );
              const endingSoon =
                daysLeft >= 0 && daysLeft <= 14 && new Date(b.endDate) >= today;
              return (
                <tr key={String(b._id)} className="border-t border-stone-800">
                  <td className="px-3 py-2 text-white">
                    {board ? `${board.city} — ${board.address}` : "—"}
                  </td>
                  <td className="px-3 py-2">{b.clientName}</td>
                  <td className="px-3 py-2">
                    {new Date(b.startDate).toLocaleDateString()} →{" "}
                    {new Date(b.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2">
                    <StatusBadge status={b.depositStatus} />
                  </td>
                  <td className="px-3 py-2">
                    {formatMoney(b.agreedPrice, settings.currency)}
                  </td>
                  <td className="px-3 py-2">
                    {endingSoon ? (
                      <span className="text-amber-400">
                        Ends in {daysLeft}d — resell
                      </span>
                    ) : daysLeft < 0 ? (
                      <span className="text-stone-500">Ended</span>
                    ) : (
                      <span className="text-stone-500">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
