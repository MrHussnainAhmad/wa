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
      className="mt-5 flex w-full max-w-md flex-col gap-2 sm:mt-6 sm:flex-row"
    >
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search city, area, digital…"
        aria-label="Search boards"
        className="min-h-12 border-stone-600 bg-stone-950/70"
      />
      <Button type="submit" className="min-h-12 w-full shrink-0 sm:w-auto">
        Search
      </Button>
    </form>
  );
}
