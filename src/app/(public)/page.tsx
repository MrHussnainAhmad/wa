import Image from "next/image";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import { Board, Testimonial, Faq } from "@/models";
import { getSettings } from "@/lib/settings";
import { BRAND } from "@/lib/brand";
import { BoardCard } from "@/components/public/BoardCard";
import { HomeSearch } from "@/components/public/HomeSearch";
import { Button } from "@/components/ui/Button";
import { formatTraffic, whatsappLink } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await connectDB();
  const [boards, testimonials, faqs, settings, cities] = await Promise.all([
    Board.find().sort({ createdAt: -1 }).limit(6).lean(),
    Testimonial.find({ active: true }).sort({ displayOrder: 1 }).lean(),
    Faq.find({ active: true }).sort({ displayOrder: 1 }).lean(),
    getSettings(),
    Board.distinct("city"),
  ]);

  const allBoards = await Board.find().select("dailyTraffic city").lean();
  const totalBoards = allBoards.length;
  const avgTraffic =
    totalBoards === 0
      ? 0
      : Math.round(
          allBoards.reduce((s, b) => s + (b.dailyTraffic || 0), 0) / totalBoards
        );

  return (
    <>
      <section className="relative min-h-[min(92vh,900px)] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1800&q=80"
          alt="City night billboards"
          fill
          priority
          sizes="100vw"
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/70 to-stone-950/30" />
        <div className="relative mx-auto flex min-h-[min(92vh,900px)] max-w-6xl flex-col justify-end px-4 pb-12 pt-24 sm:px-6 sm:pb-20 sm:pt-28">
          <p className="font-[family-name:var(--font-display)] text-4xl leading-[0.95] tracking-wide text-white sm:text-7xl md:text-8xl">
            {BRAND.name}
          </p>
          <h1 className="mt-3 max-w-xl text-base text-stone-200 sm:mt-4 sm:text-2xl">
            {BRAND.tagline}
          </h1>
          <div className="mt-6 flex w-full flex-col gap-3 sm:mt-8 sm:w-auto sm:flex-row sm:flex-wrap">
            <Link href="/boards" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto">
                Browse boards
              </Button>
            </Link>
            <Link href="/quote" className="w-full sm:w-auto">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Get a quote
              </Button>
            </Link>
          </div>
          <HomeSearch />
        </div>
      </section>

      <section className="border-y border-stone-800 bg-stone-900/40">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-8 text-center sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-10">
          <div>
            <p className="font-[family-name:var(--font-display)] text-3xl text-amber-400 sm:text-5xl">
              {totalBoards}
            </p>
            <p className="mt-1 text-xs uppercase tracking-wider text-stone-400 sm:text-sm">
              Boards
            </p>
          </div>
          <div>
            <p className="font-[family-name:var(--font-display)] text-3xl text-amber-400 sm:text-5xl">
              {cities.length}
            </p>
            <p className="mt-1 text-xs uppercase tracking-wider text-stone-400 sm:text-sm">
              Cities
            </p>
          </div>
          <div>
            <p className="font-[family-name:var(--font-display)] text-3xl text-amber-400 sm:text-5xl">
              {formatTraffic(avgTraffic)}
            </p>
            <p className="mt-1 text-xs uppercase tracking-wider text-stone-400 sm:text-sm">
              Avg daily traffic
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-6 flex flex-col gap-2 sm:mb-8 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-3xl text-white sm:text-5xl">
              Featured boards
            </h2>
            <p className="mt-2 text-sm text-stone-400 sm:text-base">
              Live inventory from the database.
            </p>
          </div>
          <Link
            href="/boards"
            className="text-sm text-amber-400 hover:underline sm:shrink-0"
          >
            View all
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
      </section>

      <section className="bg-stone-900/30 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="font-[family-name:var(--font-display)] text-3xl text-white sm:text-5xl">
            Clients on the street
          </h2>
          <div className="mt-6 grid gap-6 sm:mt-8 md:grid-cols-3">
            {testimonials.map((t) => (
              <blockquote
                key={String(t._id)}
                className="border-l-2 border-amber-500 pl-4"
              >
                <p className="text-stone-200">&ldquo;{t.quote}&rdquo;</p>
                <footer className="mt-3 text-sm text-stone-400">
                  {t.clientName} · {t.company}
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <h2 className="font-[family-name:var(--font-display)] text-3xl text-white sm:text-5xl">
          FAQ
        </h2>
        <div className="mt-6 space-y-4 sm:mt-8">
          {faqs.map((f) => (
            <details
              key={String(f._id)}
              className="border border-stone-800 bg-stone-900/40 p-4"
            >
              <summary className="cursor-pointer font-semibold text-white">
                {f.question}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-stone-300">
                {f.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      <section className="border-t border-stone-800 bg-stone-900/50 py-14">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-3xl text-white">
              Ready to own a corner of the city?
            </h2>
            <p className="mt-1 text-stone-400">Talk to sales on WhatsApp or request a quote.</p>
          </div>
          <div className="flex gap-3">
            <a
              href={whatsappLink(
                settings.whatsappNumber,
                `Hi ${BRAND.name} — interested in a board.`
              )}
              target="_blank"
              rel="noreferrer"
            >
              <Button>WhatsApp</Button>
            </a>
            <Link href="/contact">
              <Button variant="secondary">Contact</Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
