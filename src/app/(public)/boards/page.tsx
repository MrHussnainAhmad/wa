import { Suspense } from "react";
import { connectDB } from "@/lib/db";
import { Board } from "@/models";
import { getSettings } from "@/lib/settings";
import { fuzzyBoardFilter } from "@/lib/search";
import { BoardCard } from "@/components/public/BoardCard";
import { CityFilter } from "@/components/public/CityFilter";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Boards",
  description: "Browse available and booked outdoor advertising boards by city.",
};

export default async function BoardsPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; q?: string }>;
}) {
  const { city, q } = await searchParams;
  await connectDB();

  const filter = fuzzyBoardFilter(q, city);

  const [boards, cities, settings] = await Promise.all([
    Board.find(filter).sort({ city: 1, createdAt: -1 }).lean(),
    Board.distinct("city"),
    getSettings(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-24 sm:pt-28 sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-3xl text-white sm:text-6xl">
        Boards
      </h1>
      <p className="mt-2 text-stone-400">
        Search loosely by city, area, size, or type.
      </p>
      <div className="mt-6">
        <Suspense fallback={null}>
          <CityFilter cities={cities.sort()} />
        </Suspense>
      </div>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {boards.map((b) => (
          <BoardCard
            key={String(b._id)}
            board={{
              id: String(b._id),
              city: b.city,
              address: b.address,
              type: b.type,
              dailyTraffic: b.dailyTraffic,
              pricePerMonth: b.pricePerMonth,
              status: b.status,
              size: b.size,
              photoUrl: b.photos?.[0]?.url,
              currency: settings.currency,
            }}
          />
        ))}
      </div>
      {boards.length === 0 ? (
        <p className="mt-12 text-center text-stone-400">No boards match.</p>
      ) : null}
    </div>
  );
}
