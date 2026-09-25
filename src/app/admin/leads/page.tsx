import { connectDB } from "@/lib/db";
import { Lead } from "@/models";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { updateLead } from "@/app/admin/actions";
import { Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { BRAND } from "@/lib/brand";
import { whatsappLink } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  await connectDB();
  const filter = status ? { status } : {};
  const leads = await Lead.find(filter)
    .populate("boardId")
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="space-y-5">
      <header className="space-y-2 border-b border-stone-800 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-[family-name:var(--font-display)] text-4xl text-white">
            Leads
          </h1>
          <div className="flex flex-wrap gap-2 text-sm">
            {["", "NEW", "CONTACTED", "WON", "LOST"].map((s) => (
              <a
                key={s || "all"}
                href={s ? `/admin/leads?status=${s}` : "/admin/leads"}
                className={`px-2 py-1 ${
                  (status || "") === s
                    ? "bg-amber-500 text-stone-950"
                    : "bg-stone-900 text-stone-300"
                }`}
              >
                {s || "ALL"}
              </a>
            ))}
          </div>
        </div>
        <p className="max-w-2xl text-sm text-stone-400">
          Website inquiries (quote or contact). Use WhatsApp to open a normal chat
          with the lead — no Business API needed. Update status as you follow up.
        </p>
      </header>

      <div className="space-y-4">
        {leads.map((lead) => {
          const board = lead.boardId as unknown as {
            city?: string;
            address?: string;
          } | null;
          const wa = whatsappLink(
            lead.phone,
            `Hi ${lead.name}, this is ${BRAND.name} following up on your ${lead.source === "QUOTE" ? "quote request" : "message"} about ${lead.cityInterested}.`
          );
          return (
            <article
              key={String(lead._id)}
              className="border border-stone-800 bg-stone-900/30 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-white">{lead.name}</h2>
                  <p className="text-sm text-stone-400">
                    {lead.phone} · {lead.cityInterested} · {lead.source}
                  </p>
                  {board ? (
                    <p className="mt-1 text-xs text-stone-500">
                      Board: {board.city} — {board.address}
                    </p>
                  ) : null}
                  {lead.quoteTotal != null ? (
                    <p className="mt-1 text-xs text-amber-400">
                      Quote: {lead.quoteTotal} ({lead.quoteMonths} mo)
                    </p>
                  ) : null}
                  <a
                    href={wa}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-sm text-[#25D366] hover:underline"
                  >
                    WhatsApp this lead
                  </a>
                </div>
                <StatusBadge status={lead.status} />
              </div>
              <form
                action={async (fd) => {
                  "use server";
                  await updateLead(String(lead._id), fd);
                }}
                className="mt-4 grid gap-3 sm:grid-cols-[160px_1fr_auto]"
              >
                <Select name="status" defaultValue={lead.status}>
                  <option value="NEW">NEW</option>
                  <option value="CONTACTED">CONTACTED</option>
                  <option value="WON">WON</option>
                  <option value="LOST">LOST</option>
                </Select>
                <Textarea
                  name="notes"
                  defaultValue={lead.notes || ""}
                  rows={2}
                  placeholder="Notes"
                />
                <Button type="submit" size="sm">
                  Save
                </Button>
              </form>
            </article>
          );
        })}
        {leads.length === 0 ? (
          <p className="text-stone-400">No leads for this filter.</p>
        ) : null}
      </div>
    </div>
  );
}
