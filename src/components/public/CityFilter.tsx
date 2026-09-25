"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input, Select } from "@/components/ui/Input";

export function CityFilter({ cities }: { cities: string[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const city = params.get("city") || "";
  const q = params.get("q") || "";

  function update(next: { city?: string; q?: string }) {
    const sp = new URLSearchParams(params.toString());
    const cityVal = next.city ?? city;
    const qVal = next.q ?? q;
    if (cityVal) sp.set("city", cityVal);
    else sp.delete("city");
    if (qVal) sp.set("q", qVal);
    else sp.delete("q");
    router.push(`/boards?${sp.toString()}`);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Select
        value={city}
        onChange={(e) => update({ city: e.target.value })}
        aria-label="Filter by city"
      >
        <option value="">All cities</option>
        {cities.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </Select>
      <Input
        defaultValue={q}
        placeholder="Search city, area, digital, size…"
        onChange={(e) => {
          const value = e.target.value;
          window.clearTimeout((window as unknown as { __t?: number }).__t);
          (window as unknown as { __t?: number }).__t = window.setTimeout(
            () => update({ q: value }),
            300
          );
        }}
      />
    </div>
  );
}
