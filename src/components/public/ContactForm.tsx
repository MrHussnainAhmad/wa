"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { whatsappLink } from "@/lib/utils";

export function ContactForm({
  defaultCity = "",
  companyWhatsapp,
}: {
  defaultCity?: string;
  companyWhatsapp?: string;
}) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [waHref, setWaHref] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    setWaHref(null);
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") || "");
    const city = String(form.get("cityInterested") || "");
    const notes = String(form.get("notes") || "");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "CONTACT",
          name,
          phone: form.get("phone"),
          cityInterested: city,
          notes,
          website: form.get("website"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMessage("Thanks — we received your message.");
      if (companyWhatsapp) {
        setWaHref(
          whatsappLink(
            companyWhatsapp,
            `Hi Waqas Advertisers, I'm ${name} from ${city}.${notes ? ` ${notes}` : ""}`
          )
        );
      }
      e.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="relative mx-auto max-w-lg space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
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
          defaultValue={defaultCity}
          required
        />
      </div>
      <div>
        <Label htmlFor="notes">Message</Label>
        <Textarea id="notes" name="notes" rows={4} />
      </div>
      <div className="absolute -left-[9999px]" aria-hidden>
        <Input name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Sending…" : "Send message"}
      </Button>
      {message ? <p className="text-sm text-emerald-400">{message}</p> : null}
      {waHref ? (
        <a href={waHref} target="_blank" rel="noreferrer">
          <Button type="button" variant="secondary">
            Continue on WhatsApp
          </Button>
        </a>
      ) : null}
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </form>
  );
}
