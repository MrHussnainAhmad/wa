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
              className={`block truncate px-2.5 py-2 transition ${
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
          <div className={`border-b border-stone-800 ${collapsed ? "p-2" : "px-3 py-3"}`}>
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
                className="shrink-0 border border-stone-700 px-1.5 py-0.5 text-xs text-stone-400 hover:text-white"
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
                className={`w-full py-2 text-left text-sm text-stone-400 hover:text-white ${
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
          <header className="flex items-center justify-between gap-3 border-b border-stone-800 px-3 py-2.5 md:px-4">
            <div className="flex items-center gap-2 md:hidden">
              <button
                type="button"
                onClick={() => setMobileOpen((v) => !v)}
                className="border border-stone-700 px-2 py-1 text-sm text-stone-200"
              >
                Menu
              </button>
              <span className="font-[family-name:var(--font-display)] text-lg text-amber-400">
                Waqas
              </span>
            </div>
            <p className="ml-auto truncate text-xs text-stone-500">{email}</p>
          </header>

          {mobileOpen ? (
            <div className="border-b border-stone-800 p-2 md:hidden">
              <NavLinks />
              <form action={signOutAction} className="mt-2 px-2">
                <button type="submit" className="text-sm text-stone-400">
                  Sign out
                </button>
              </form>
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
