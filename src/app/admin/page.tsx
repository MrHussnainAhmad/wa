import Link from "next/link";
import { addDays, subHours } from "date-fns";
import { connectDB } from "@/lib/db";
import { Board, Booking, Lead } from "@/models";
import { Setting } from "@/models/Setting";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatMoney, whatsappLink } from "@/lib/utils";
import { DEFAULT_SETTINGS } from "@/lib/settings";
import { BRAND } from "@/lib/brand";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await connectDB();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  const in14 = addDays(todayStart, 14);
  const olderThan48h = subHours(new Date(), 48);

  const [leadsToday, endingSoon, boardStats, openLeads, staleLeads, setting] =
    await Promise.all([
      Lead.countDocuments({ createdAt: { $gte: todayStart, $lte: todayEnd } }),
      Booking.find({ endDate: { $gte: todayStart, $lte: in14 } })
        .select("clientName endDate depositStatus agreedPrice boardId")
        .populate("boardId", "city address")
        .sort({ endDate: 1 })
        .limit(20)
        .lean(),
      Board.aggregate<{ _id: string | null; count: number }>([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Lead.countDocuments({ status: { $in: ["NEW", "CONTACTED"] } }),
      Lead.find({ status: "NEW", createdAt: { $lte: olderThan48h } })
        .select("name phone cityInterested")
        .sort({ createdAt: 1 })
        .limit(8)
        .lean(),
      Setting.findOne({ key: "app" }).select("currency").lean(),
    ]);

  const boardCount = boardStats.reduce((s, r) => s + r.count, 0);
  const availableCount =
    boardStats.find((r) => r._id === "AVAILABLE")?.count ?? 0;
  const bookedCount = boardStats.find((r) => r._id === "BOOKED")?.count ?? 0;
  const currency = setting?.currency || DEFAULT_SETTINGS.currency;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-white">
          Dashboard
        </h1>
        <p className="text-stone-400">
          Ops snapshot — email digest via cron; WhatsApp is one-click wa.me.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Leads today", value: leadsToday },
          { label: "Open leads", value: openLeads },
          { label: "Boards", value: boardCount },
          {
            label: "Available / Booked",
            value: `${availableCount} / ${bookedCount}`,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="border border-stone-800 bg-stone-900/40 p-4"
          >
            <p className="text-xs uppercase tracking-wider text-stone-500">
              {s.label}
            </p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-3xl text-amber-400">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {staleLeads.length > 0 ? (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Stale leads (NEW &gt; 48h)
            </h2>
            <Link
              href="/admin/leads?status=NEW"
              className="text-sm text-amber-400"
            >
              All new leads
            </Link>
          </div>
          <ul className="divide-y divide-stone-800 border border-stone-800">
            {staleLeads.map((l) => (
              <li
                key={String(l._id)}
                className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm"
              >
                <span className="text-stone-200">
                  {l.name} · {l.cityInterested}
                </span>
                <a
                  href={whatsappLink(
                    l.phone,
                    `Hi ${l.name}, following up from ${BRAND.name} about outdoor advertising in ${l.cityInterested}.`
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#25D366] hover:underline"
                >
                  WhatsApp
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            Bookings ending in 14 days
          </h2>
          <Link href="/admin/bookings" className="text-sm text-amber-400">
            View bookings
          </Link>
        </div>
        {endingSoon.length === 0 ? (
          <p className="text-sm text-stone-400">No bookings ending soon.</p>
        ) : (
          <div className="overflow-x-auto border border-stone-800">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-stone-900 text-stone-400">
                <tr>
                  <th className="px-3 py-2">Board</th>
                  <th className="px-3 py-2">Client</th>
                  <th className="px-3 py-2">Ends</th>
                  <th className="px-3 py-2">Deposit</th>
                  <th className="px-3 py-2">Price</th>
                </tr>
              </thead>
              <tbody>
                {endingSoon.map((b) => {
                  const board = b.boardId as unknown as {
                    city?: string;
                    address?: string;
                  } | null;
                  return (
                    <tr
                      key={String(b._id)}
                      className="border-t border-stone-800"
                    >
                      <td className="px-3 py-2 text-white">
                        {board ? `${board.city} — ${board.address}` : "—"}
                      </td>
                      <td className="px-3 py-2">{b.clientName}</td>
                      <td className="px-3 py-2 text-amber-300">
                        {new Date(b.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2">
                        <StatusBadge status={b.depositStatus} />
                      </td>
                      <td className="px-3 py-2">
                        {formatMoney(b.agreedPrice, currency)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
