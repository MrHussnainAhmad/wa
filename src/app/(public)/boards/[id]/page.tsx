import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { connectDB } from "@/lib/db";
import { Board } from "@/models";
import { getBoardBookedRanges } from "@/lib/availability";
import { getSettings } from "@/lib/settings";
import { formatMoney, formatTraffic } from "@/lib/utils";
import { optimizedImageUrl } from "@/lib/cloudinary";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await connectDB();
  const board = await Board.findById(id).lean();
  if (!board) return { title: "Board" };
  return {
    title: `${board.city} — ${board.address}`,
    description: `${board.type} billboard in ${board.city}. ${board.size}. ${formatTraffic(board.dailyTraffic)} daily traffic.`,
  };
}

export default async function BoardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await connectDB();
  const board = await Board.findById(id).lean();
  if (!board) notFound();

  const [ranges, settings] = await Promise.all([
    getBoardBookedRanges(id),
    getSettings(),
  ]);

  const photos =
    board.photos?.length > 0
      ? board.photos
      : [
          {
            url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&q=80",
          },
        ];

  const heroSrc = optimizedImageUrl(photos[0].url, { width: 1600 });
  const heroUnoptimized = heroSrc.includes("images.unsplash.com");

  return (
    <div className="pb-16 pt-24">
      <div className="relative h-[50vh] min-h-[280px] w-full overflow-hidden">
        <Image
          src={heroSrc}
          alt={board.address}
          fill
          priority
          sizes="100vw"
          className="object-cover"
          unoptimized={heroUnoptimized}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-stone-950/40" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="-mt-16 relative grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <StatusBadge status={board.status} />
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl text-white sm:text-6xl">
              {board.city}
            </h1>
            <p className="mt-2 text-base text-stone-300 sm:text-lg">{board.address}</p>
            <dl className="mt-8 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-stone-500">Type</dt>
                <dd className="text-white">{board.type}</dd>
              </div>
              <div>
                <dt className="text-stone-500">Size</dt>
                <dd className="text-white">{board.size}</dd>
              </div>
              <div>
                <dt className="text-stone-500">Daily traffic</dt>
                <dd className="text-white">{formatTraffic(board.dailyTraffic)}</dd>
              </div>
              <div>
                <dt className="text-stone-500">From</dt>
                <dd className="text-amber-400">
                  {formatMoney(board.pricePerMonth, settings.currency)}/mo
                </dd>
              </div>
            </dl>

            <h2 className="mt-10 font-[family-name:var(--font-display)] text-3xl text-white">
              Availability
            </h2>
            <p className="mt-1 text-sm text-stone-400">
              Current and upcoming booked dates from live bookings.
            </p>
            {ranges.length === 0 ? (
              <p className="mt-4 text-emerald-400">Fully open — no upcoming bookings.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {ranges.map((r) => (
                  <li
                    key={String(r._id)}
                    className="border border-stone-800 bg-stone-900/50 px-4 py-3 text-sm"
                  >
                    <span className="text-white">
                      {format(new Date(r.startDate), "MMM d, yyyy")} →{" "}
                      {format(new Date(r.endDate), "MMM d, yyyy")}
                    </span>
                    <span className="ml-2 text-stone-500">({r.clientName})</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <aside className="border border-stone-800 bg-stone-900/70 p-6 h-fit">
            <p className="text-sm text-stone-400">Ready to book?</p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-3xl text-white">
              Check pricing
            </p>
            <Link href={`/quote?board=${id}`} className="mt-6 block">
              <Button className="w-full">Open quote calculator</Button>
            </Link>
            <Link href="/contact" className="mt-3 block">
              <Button variant="secondary" className="w-full">
                Contact sales
              </Button>
            </Link>
          </aside>
        </div>

        {photos.length > 1 ? (
          <div className="mt-12 grid gap-3 sm:grid-cols-3">
            {photos.slice(1).map((p: { url: string }, i: number) => {
              const src = optimizedImageUrl(p.url, { width: 600 });
              return (
                <div key={i} className="relative aspect-video overflow-hidden">
                  <Image
                    src={src}
                    alt=""
                    fill
                    loading="lazy"
                    className="object-cover"
                    sizes="33vw"
                    unoptimized={src.includes("images.unsplash.com")}
                  />
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
