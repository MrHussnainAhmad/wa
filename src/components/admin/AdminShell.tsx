"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/app/admin/sign-out";

type NavLink = { href: string; label: string };

export function AdminShell({
  email,
  role,
  isSuper,
  links,
  children,
}: {
  email: string;
  role: string;
  isSuper: boolean;
  links: NavLink[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("wa-nav-collapsed");
    if (saved === "1") setCollapsed(true);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  function toggleCollapsed() {
    setCollapsed((v) => {
      const next = !v;
      localStorage.setItem("wa-nav-collapsed", next ? "1" : "0");
      return next;
    });
  }

  const allLinks = [
    ...links,
    ...(isSuper
      ? [
          { href: "/admin/settings", label: "Settings" },
          { href: "/admin/users", label: "Users" },
        ]
      : []),
  ];

  function NavLinks({ compact }: { compact?: boolean }) {
    return (
      <nav className="space-y-0.5 text-sm">
        {allLinks.map((l) => {
          const active =
            l.href === "/admin"
              ? pathname === "/admin"
              : pathname === l.href || pathname.startsWith(`${l.href}/`);
          return (
            <Link
              key={l.href}
              href={l.href}
              title={l.label}
              onClick={() => setMobileOpen(false)}
              className={`block truncate px-3 py-3 transition sm:px-2.5 sm:py-2 ${
                active
                  ? "bg-amber-500/15 text-amber-400"
                  : "text-stone-300 hover:bg-stone-800 hover:text-white"
              } ${compact ? "text-center text-xs" : ""}`}
            >
              {compact ? l.label.slice(0, 1) : l.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <div className="flex min-h-screen">
        <aside
          className={`hidden shrink-0 border-r border-stone-800 bg-stone-900/50 transition-[width] md:flex md:flex-col ${
            collapsed ? "w-14" : "w-52"
          }`}
        >
          <div
            className={`border-b border-stone-800 ${collapsed ? "p-2" : "px-3 py-3"}`}
          >
            <div className="flex items-center justify-between gap-2">
              {!collapsed ? (
                <Link
                  href="/admin"
                  className="font-[family-name:var(--font-display)] text-lg leading-none text-amber-400"
                >
                  Waqas
                </Link>
              ) : (
                <Link
                  href="/admin"
                  className="mx-auto font-[family-name:var(--font-display)] text-lg text-amber-400"
                >
                  W
                </Link>
              )}
              <button
                type="button"
                onClick={toggleCollapsed}
                className="flex size-8 shrink-0 items-center justify-center border border-stone-700 text-xs text-stone-400 hover:text-white"
                aria-label={collapsed ? "Expand menu" : "Collapse menu"}
              >
                {collapsed ? "»" : "«"}
              </button>
            </div>
            {!collapsed ? (
              <p className="mt-1 truncate text-[10px] uppercase tracking-wider text-stone-500">
                {role.replace("_", " ")}
              </p>
            ) : null}
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <NavLinks compact={collapsed} />
          </div>
          <div className="border-t border-stone-800 p-2">
            <form action={signOutAction}>
              <button
                type="submit"
                className={`w-full py-2.5 text-left text-sm text-stone-400 hover:text-white ${
                  collapsed ? "text-center text-xs" : "px-2"
                }`}
                title="Sign out"
              >
                {collapsed ? "Out" : "Sign out"}
              </button>
            </form>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-stone-800 bg-stone-950/95 px-3 py-2.5 backdrop-blur md:px-4">
            <div className="flex min-w-0 items-center gap-2 md:hidden">
              <button
                type="button"
                onClick={() => setMobileOpen((v) => !v)}
                className="flex size-11 shrink-0 items-center justify-center border border-stone-700 text-stone-100"
                aria-expanded={mobileOpen}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
              >
                <span className="flex w-5 flex-col gap-1.5">
                  <span
                    className={`h-0.5 w-full bg-current transition ${
                      mobileOpen ? "translate-y-2 rotate-45" : ""
                    }`}
                  />
                  <span
                    className={`h-0.5 w-full bg-current transition ${
                      mobileOpen ? "opacity-0" : ""
                    }`}
                  />
                  <span
                    className={`h-0.5 w-full bg-current transition ${
                      mobileOpen ? "-translate-y-2 -rotate-45" : ""
                    }`}
                  />
                </span>
              </button>
              <span className="truncate font-[family-name:var(--font-display)] text-lg text-amber-400">
                Waqas
              </span>
            </div>
            <p className="ml-auto max-w-[55%] truncate text-xs text-stone-500 sm:max-w-none">
              {email}
            </p>
          </header>

          {mobileOpen ? (
            <div className="fixed inset-0 z-40 md:hidden">
              <button
                type="button"
                aria-label="Close menu overlay"
                className="absolute inset-0 bg-stone-950/70"
                onClick={() => setMobileOpen(false)}
              />
              <div className="absolute inset-y-0 left-0 flex w-[min(18rem,85vw)] flex-col border-r border-stone-800 bg-stone-950 shadow-xl">
                <div className="flex items-center justify-between border-b border-stone-800 px-3 py-3">
                  <span className="font-[family-name:var(--font-display)] text-lg text-amber-400">
                    Menu
                  </span>
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    className="flex size-10 items-center justify-center border border-stone-700 text-stone-300"
                    aria-label="Close menu"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                  <NavLinks />
                </div>
                <div className="border-t border-stone-800 p-3">
                  <p className="mb-2 truncate text-xs text-stone-500">{email}</p>
                  <form action={signOutAction}>
                    <button
                      type="submit"
                      className="w-full border border-stone-700 px-3 py-3 text-left text-sm text-stone-300"
                    >
                      Sign out
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ) : null}

          <main className="mx-auto w-full max-w-6xl flex-1 px-3 py-4 sm:px-4">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
