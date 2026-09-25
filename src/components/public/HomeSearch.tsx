"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function HomeSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const query = q.trim();
    router.push(query ? `/boards?q=${encodeURIComponent(query)}` : "/boards");
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-6 flex w-full max-w-md flex-col gap-2 sm:flex-row"
    >
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search city, area, digital…"
        aria-label="Search boards"
        className="border-stone-600 bg-stone-950/70"
      />
      <Button type="submit" className="shrink-0">
        Search
      </Button>
    </form>
  );
}
