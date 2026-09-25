import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col bg-stone-950 text-stone-100">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(245,158,11,0.18), transparent), linear-gradient(to bottom, #1c1917 0%, #0c0a09 55%)",
        }}
      />

      <header className="relative z-10 px-4 py-5 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Link href="/" className="block w-fit leading-none text-white">
            <span className="block font-[family-name:var(--font-display)] text-2xl leading-none tracking-wide sm:text-3xl">
              Waqas
            </span>
            <span className="-mt-1 block font-[family-name:var(--font-display)] text-sm leading-none tracking-[0.18em] text-stone-300 sm:text-base">
              Advertisers
            </span>
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pb-20 text-center">
        <p className="font-[family-name:var(--font-display)] text-[7rem] leading-none text-amber-500/90 sm:text-[10rem]">
          404
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-wide text-white sm:text-5xl">
          Board not on this corner
        </h1>
        <p className="mt-3 max-w-md text-stone-400">
          That page isn&apos;t on our map. Head back to live inventory or the
          homepage.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/">
            <Button size="lg">Home</Button>
          </Link>
          <Link href="/boards">
            <Button size="lg" variant="secondary">
              Browse boards
            </Button>
          </Link>
        </div>
      </main>

      <footer className="relative z-10 border-t border-stone-800 px-4 py-6 text-center text-xs text-stone-500">
        Outdoor advertising across Pakistan
      </footer>
    </div>
  );
}
