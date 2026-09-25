import { Resend } from "resend";
import { BRAND } from "@/lib/brand";
import { getSiteUrl } from "@/lib/site";
import { whatsappLink } from "@/lib/utils";

const resendKey = process.env.RESEND_API_KEY;
const resend = resendKey ? new Resend(resendKey) : null;

async function send(input: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  const from =
    process.env.EMAIL_FROM ||
    `${BRAND.name} <onboarding@resend.dev>`;

  if (!resend) {
    console.log("[email:dev]", input.subject, "→", input.to);
    console.log(input.html.replace(/<[^>]+>/g, " ").slice(0, 500));
    return { id: "dev-log" };
  }

  const { data, error } = await resend.emails.send({
    from,
    to: input.to,
    subject: input.subject,
    html: input.html,
  });

  if (error) {
    console.error("[email:error]", error);
    throw new Error(
      typeof error === "object" && error && "message" in error
        ? String((error as { message: string }).message)
        : "Resend send failed"
    );
  }

  return data;
}

export async function notifyNewLead(lead: {
  name: string;
  phone: string;
  cityInterested: string;
  source: string;
  boardId?: string | null;
  quoteTotal?: number | null;
  quoteMonths?: number | null;
}) {
  const to = process.env.ADMIN_NOTIFY_EMAIL;
  if (!to) return;

  const base = getSiteUrl();
  const chatClient = whatsappLink(
    lead.phone,
    `Hi ${lead.name}, this is ${BRAND.name}. Thanks for your ${lead.source === "QUOTE" ? "quote request" : "message"} about outdoor advertising in ${lead.cityInterested}.`
  );

  await send({
    to,
    subject: `New lead — ${lead.name} (${lead.source})`,
    html: `
      <h2>New website lead</h2>
      <p><strong>Name:</strong> ${lead.name}</p>
      <p><strong>Phone:</strong> ${lead.phone}</p>
      <p><strong>City:</strong> ${lead.cityInterested}</p>
      <p><strong>Source:</strong> ${lead.source}</p>
      ${lead.boardId ? `<p><strong>Board id:</strong> ${lead.boardId}</p>` : ""}
      ${
        lead.quoteTotal != null
          ? `<p><strong>Quote:</strong> ${lead.quoteTotal}${
              lead.quoteMonths ? ` / ${lead.quoteMonths} mo` : ""
            }</p>`
          : ""
      }
      <p><a href="${chatClient}">Open WhatsApp chat with this lead</a> (uses normal WhatsApp — no Business API)</p>
      <p><a href="${base}/admin/leads">Open Leads in admin</a></p>
    `,
  });
}

export async function sendDailyOpsDigest(input: {
  endingSoon: Array<{
    boardLabel: string;
    clientName: string;
    endDate: string;
    daysLeft: number;
  }>;
  newLeads: Array<{
    name: string;
    phone: string;
    city: string;
    source: string;
  }>;
  staleLeads: Array<{
    name: string;
    phone: string;
    city: string;
    ageHours: number;
  }>;
  boardsSynced: number;
}) {
  const to = process.env.ADMIN_NOTIFY_EMAIL;
  if (!to) return;

  const base = getSiteUrl();
  const ending =
    input.endingSoon.length === 0
      ? "<li>None</li>"
      : input.endingSoon
          .map(
            (r) =>
              `<li><strong>${r.boardLabel}</strong> — ${r.clientName} ends ${r.endDate} (${r.daysLeft}d left)</li>`
          )
          .join("");

  const leads =
    input.newLeads.length === 0
      ? "<li>None in last 24h</li>"
      : input.newLeads
          .map(
            (l) =>
              `<li>${l.name} · ${l.phone} · ${l.city} · ${l.source} — <a href="${whatsappLink(l.phone, `Hi ${l.name}, this is ${BRAND.name}.`)}">WhatsApp</a></li>`
          )
          .join("");

  const stale =
    input.staleLeads.length === 0
      ? "<li>None</li>"
      : input.staleLeads
          .map(
            (l) =>
              `<li>${l.name} · ${l.phone} · ${l.city} · waiting ~${l.ageHours}h — <a href="${whatsappLink(l.phone, `Hi ${l.name}, following up from ${BRAND.name}.`)}">WhatsApp</a></li>`
          )
          .join("");

  await send({
    to,
    subject: `${BRAND.name} daily ops — ${input.endingSoon.length} ending, ${input.newLeads.length} new leads`,
    html: `
      <h2>Daily ops digest</h2>
      <p>Board availability synced: <strong>${input.boardsSynced}</strong> boards.</p>
      <h3>Bookings ending ≤14 days</h3>
      <ul>${ending}</ul>
      <h3>New leads (24h)</h3>
      <ul>${leads}</ul>
      <h3>Stale NEW leads (&gt;48h)</h3>
      <ul>${stale}</ul>
      <p><a href="${base}/admin">Open dashboard</a></p>
      <p style="color:#666;font-size:12px">WhatsApp links open normal chat (wa.me). No WhatsApp Business API required.</p>
    `,
  });
}

/** @deprecated use sendDailyOpsDigest — kept for old cron URL */
export async function sendBookingDigest(
  rows: Array<{
    boardLabel: string;
    clientName: string;
    endDate: string;
    daysLeft: number;
  }>
) {
  await sendDailyOpsDigest({
    endingSoon: rows,
    newLeads: [],
    staleLeads: [],
    boardsSynced: 0,
  });
}
