"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { formatMoney, whatsappLink } from "@/lib/utils";
import type { QuoteBreakdown } from "@/types";

type BoardOption = {
  id: string;
  label: string;
  city: string;
};

export function QuoteForm({
  boards,
  initialBoardId,
  durations,
  companyWhatsapp,
}: {
  boards: BoardOption[];
  initialBoardId?: string;
  durations: number[];
  companyWhatsapp?: string;
}) {
  const [boardId, setBoardId] = useState(initialBoardId || boards[0]?.id || "");
  const [months, setMonths] = useState(durations[0] || 1);
  const [quote, setQuote] = useState<QuoteBreakdown | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [waHref, setWaHref] = useState<string | null>(null);

  useEffect(() => {
    if (!boardId) return;
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ boardId, months }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Quote failed");
        if (!cancelled) setQuote(data.quote);
      } catch (e) {
        if (!cancelled) {
          setQuote(null);
          setError(e instanceof Error ? e.message : "Quote failed");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [boardId, months]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    setError("");
    setWaHref(null);
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") || "");
    const city = String(form.get("cityInterested") || "");
    const boardLabel = boards.find((b) => b.id === boardId)?.label || "board";
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "QUOTE",
          name,
          phone: form.get("phone"),
          cityInterested: city,
          boardId,
          months,
          notes: form.get("notes"),
          website: form.get("website"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMessage("Quote request sent. Our team will contact you shortly.");
      if (companyWhatsapp && quote) {
        setWaHref(
          whatsappLink(
            companyWhatsapp,
            `Hi Waqas Advertisers, I'm ${name}. I requested a quote for ${boardLabel} (${months} months). Estimated total: ${formatMoney(quote.total, quote.currency)}. City: ${city}.`
          )
        );
      }
      e.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  }

  const selectedCity =
    boards.find((b) => b.id === boardId)?.city || boards[0]?.city || "";

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-4">
        <div>
          <Label htmlFor="boardId">Board</Label>
          <Select
            id="boardId"
            value={boardId}
            onChange={(e) => setBoardId(e.target.value)}
            required
          >
            {boards.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="months">Duration (months)</Label>
          <Select
            id="months"
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
          >
            {durations.map((d) => (
              <option key={d} value={d}>
                {d} month{d > 1 ? "s" : ""}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="name">Your name</Label>
          <Input id="name" name="name" required />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" required />
        </div>
        <div>
          <Label htmlFor="cityInterested">City interested in</Label>
          <Input
            id="cityInterested"
            name="cityInterested"
            defaultValue={selectedCity}
            required
          />
        </div>
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" name="notes" rows={3} />
        </div>
        <div className="absolute -left-[9999px]" aria-hidden>
          <Label htmlFor="website">Website</Label>
          <Input id="website" name="website" tabIndex={-1} autoComplete="off" />
        </div>
        <Button type="submit" disabled={submitting || !quote}>
          {submitting ? "Sending…" : "Request this quote"}
        </Button>
        {message ? <p className="text-sm text-emerald-400">{message}</p> : null}
        {waHref ? (
          <a href={waHref} target="_blank" rel="noreferrer">
            <Button type="button" variant="secondary" className="mt-2">
              Continue on WhatsApp
            </Button>
          </a>
        ) : null}
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
      </div>

      <div className="border border-stone-800 bg-stone-900/50 p-6">
        <h3 className="font-[family-name:var(--font-display)] text-2xl text-white">
          Live quote
        </h3>
        <p className="mt-1 text-sm text-stone-400">
          Calculated on the server from real board rates and settings.
        </p>
        {loading ? (
          <p className="mt-6 text-stone-400">Calculating…</p>
        ) : quote ? (
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between text-stone-300">
              <dt>Monthly rate</dt>
              <dd>{formatMoney(quote.pricePerMonth, quote.currency)}</dd>
            </div>
            <div className="flex justify-between text-stone-300">
              <dt>Duration</dt>
              <dd>{quote.months} mo</dd>
            </div>
            <div className="flex justify-between text-stone-300">
              <dt>Duration multiplier</dt>
              <dd>×{quote.durationMultiplier}</dd>
            </div>
            <div className="flex justify-between text-stone-300">
              <dt>Type multiplier</dt>
              <dd>×{quote.typeMultiplier}</dd>
            </div>
            <div className="flex justify-between text-stone-300">
              <dt>Subtotal</dt>
              <dd>{formatMoney(quote.subtotal, quote.currency)}</dd>
            </div>
            <div className="flex justify-between text-stone-300">
              <dt>Design fee</dt>
              <dd>{formatMoney(quote.designFee, quote.currency)}</dd>
            </div>
            <div className="flex justify-between border-t border-stone-700 pt-3 text-lg font-semibold text-white">
              <dt>Total</dt>
              <dd className="text-amber-400">
                {formatMoney(quote.total, quote.currency)}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="mt-6 text-stone-400">Select a board to see pricing.</p>
        )}
      </div>
    </form>
  );
}
