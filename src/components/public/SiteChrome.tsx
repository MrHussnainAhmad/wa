"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BRAND } from "@/lib/brand";
import { whatsappLink } from "@/lib/utils";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className ?? "size-5 fill-current"}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

const NAV = [
  { href: "/boards", label: "Boards" },
  { href: "/quote", label: "Quote" },
  { href: "/contact", label: "Contact" },
] as const;

export function SiteHeader({ whatsapp }: { whatsapp?: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const waHref = whatsapp
    ? whatsappLink(whatsapp, `Hi ${BRAND.name} — I want to book a board.`)
    : null;

  return (
    <header className="absolute inset-x-0 top-0 z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5">
        <Link
          href="/"
          className="relative z-50 block min-w-0 leading-none text-white"
          onClick={() => setOpen(false)}
        >
          <span className="block font-[family-name:var(--font-display)] text-2xl leading-none tracking-wide sm:text-3xl">
            Waqas
          </span>
          <span className="-mt-1 block font-[family-name:var(--font-display)] text-sm leading-none tracking-[0.18em] text-stone-300 sm:text-base">
            Advertisers
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2 text-sm text-stone-200 transition hover:text-amber-400"
            >
              {item.label}
            </Link>
          ))}
          {waHref ? (
            <a
              href={waHref}
              target="_blank"
              rel="noreferrer"
              className="ml-2 bg-amber-500 px-4 py-2.5 text-sm font-semibold text-stone-950 transition hover:bg-amber-400"
            >
              WhatsApp
            </a>
          ) : null}
        </nav>

        {/* Mobile menu button */}
        <button
          type="button"
          className="relative z-50 flex size-11 items-center justify-center border border-stone-600/80 bg-stone-950/50 text-white md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">{open ? "Close" : "Menu"}</span>
          <span className="flex w-5 flex-col gap-1.5">
            <span
              className={`h-0.5 w-full bg-current transition ${
                open ? "translate-y-2 rotate-45" : ""
              }`}
            />
            <span
              className={`h-0.5 w-full bg-current transition ${
                open ? "opacity-0" : ""
              }`}
            />
            <span
              className={`h-0.5 w-full bg-current transition ${
                open ? "-translate-y-2 -rotate-45" : ""
              }`}
            />
          </span>
        </button>
      </div>

      {/* Mobile panel */}
      <div
        id="mobile-nav"
        className={`fixed inset-0 z-40 md:hidden ${open ? "" : "pointer-events-none"}`}
      >
        <button
          type="button"
          aria-label="Close menu overlay"
          className={`absolute inset-0 bg-stone-950/80 transition-opacity ${
            open ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setOpen(false)}
        />
        <nav
          className={`absolute inset-x-0 top-0 border-b border-stone-800 bg-stone-950 px-4 pb-6 pt-20 shadow-xl transition-transform duration-200 sm:px-6 ${
            open ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <ul className="space-y-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block px-2 py-3.5 text-lg text-stone-100 hover:text-amber-400"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          {waHref ? (
            <a
              href={waHref}
              target="_blank"
              rel="noreferrer"
              onClick={() => setOpen(false)}
              className="mt-4 flex min-h-12 items-center justify-center bg-amber-500 px-4 text-base font-semibold text-stone-950 hover:bg-amber-400"
            >
              WhatsApp
            </a>
          ) : null}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter({ whatsapp }: { whatsapp?: string }) {
  return (
    <footer className="border-t border-stone-800 bg-stone-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="font-[family-name:var(--font-display)] text-xl text-white">
            {BRAND.name}
          </p>
          <p className="mt-1 text-sm text-stone-400">{BRAND.tagline}</p>
        </div>
        <div className="flex flex-wrap items-center gap-1 text-sm text-stone-300">
          {[
            { href: "/boards", label: "Boards" },
            { href: "/quote", label: "Quote" },
            { href: "/contact", label: "Contact" },
            { href: "/privacy", label: "Privacy" },
            { href: "/terms", label: "Terms" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-3 py-2.5 hover:text-amber-400"
            >
              {l.label}
            </Link>
          ))}
          {whatsapp ? (
            <a
              href={whatsappLink(whatsapp)}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              title="WhatsApp"
              className="inline-flex size-11 items-center justify-center text-stone-300 hover:text-[#25D366]"
            >
              <WhatsAppIcon className="size-6 fill-current" />
            </a>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
