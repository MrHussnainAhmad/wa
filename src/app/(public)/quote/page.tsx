import { connectDB } from "@/lib/db";
import { Board } from "@/models";
import { getSettings } from "@/lib/settings";
import { QuoteForm } from "@/components/public/QuoteForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Quote calculator",
  description: "Server-side pricing based on live board rates and design fees.",
};

export default async function QuotePage({
  searchParams,
}: {
  searchParams: Promise<{ board?: string }>;
}) {
  const { board: boardParam } = await searchParams;
  await connectDB();
  const [boards, settings] = await Promise.all([
    Board.find().sort({ city: 1 }).lean(),
    getSettings(),
  ]);

  const options = boards.map((b) => ({
    id: String(b._id),
    city: b.city,
    label: `${b.city} — ${b.address} (${b.type})`,
  }));

  const durations = Object.keys(settings.durationMultipliers)
    .map(Number)
    .filter((n) => !Number.isNaN(n))
    .sort((a, b) => a - b);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-28 sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-5xl text-white sm:text-6xl">
        Quote calculator
      </h1>
      <p className="mt-2 max-w-2xl text-stone-400">
        Totals use the board&apos;s real monthly rate, duration and type multipliers,
        plus the design fee from settings — never hardcoded in the browser.
      </p>
      <div className="mt-10">
        {options.length === 0 ? (
          <p className="text-stone-400">No boards yet. Seed the database first.</p>
        ) : (
          <QuoteForm
            boards={options}
            initialBoardId={boardParam}
            durations={durations.length ? durations : [1, 3, 6, 12]}
            companyWhatsapp={settings.whatsappNumber}
          />
        )}
      </div>
    </div>
  );
}
