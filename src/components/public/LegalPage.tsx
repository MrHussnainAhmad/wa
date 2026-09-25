import type { ReactNode } from "react";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <article className="mx-auto max-w-3xl px-4 pb-16 pt-28 sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-5xl text-white sm:text-6xl">
        {title}
      </h1>
      <p className="mt-2 text-sm text-stone-500">Last updated: {updated}</p>
      <div className="prose-legal mt-10 space-y-6 text-sm leading-relaxed text-stone-300 sm:text-base">
        {children}
      </div>
    </article>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
