import { Resend } from "resend";
import { BRAND } from "@/lib/brand";
import { getSiteUrl } from "@/lib/site";
import { whatsappLink } from "@/lib/utils";

const resendKey = process.env.RESEND_API_KEY;
const resend = resendKey ? new Resend(resendKey) : null;

const C = {
  bg: "#0c0a09",
  card: "#1c1917",
  border: "#292524",
  text: "#f5f5f4",
  muted: "#a8a29e",
  amber: "#f59e0b",
  amberDark: "#d97706",
  green: "#25D366",
  white: "#ffffff",
};

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function btn(href: string, label: string, bg = C.amber, color = "#0c0a09") {
  return `<a href="${href}" style="display:inline-block;background:${bg};color:${color};font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;text-decoration:none;padding:10px 16px;border-radius:2px;letter-spacing:0.02em;">${esc(label)}</a>`;
}

function sectionTitle(title: string) {
  return `<tr><td style="padding:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${C.amber};">${esc(title)}</td></tr>`;
}

function emptyRow(text: string) {
  return `<tr><td style="padding:12px 14px;background:${C.card};border:1px solid ${C.border};font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${C.muted};">${esc(text)}</td></tr>`;
}

function wrapEmail(opts: {
  preheader: string;
  title: string;
  subtitle?: string;
  bodyHtml: string;
}) {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/><title>${esc(opts.title)}</title></head>
<body style="margin:0;padding:0;background:${C.bg};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(opts.preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg};padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${C.bg};">
          <tr>
            <td style="padding:8px 4px 20px;border-bottom:2px solid ${C.amber};">
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:26px;font-weight:700;letter-spacing:0.04em;color:${C.white};line-height:1;">WAQAS</div>
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:600;letter-spacing:0.22em;color:${C.muted};margin-top:2px;">ADVERTISERS</div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 4px 8px;">
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:700;color:${C.white};line-height:1.25;">${esc(opts.title)}</div>
              ${
                opts.subtitle
                  ? `<div style="margin-top:6px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${C.muted};line-height:1.45;">${esc(opts.subtitle)}</div>`
                  : ""
              }
            </td>
          </tr>
          <tr>
            <td style="padding:12px 0 8px;">${opts.bodyHtml}</td>
          </tr>
          <tr>
            <td style="padding:24px 4px 8px;border-top:1px solid ${C.border};">
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:${C.muted};line-height:1.5;">
                © ${year} ${esc(BRAND.name)} · Outdoor advertising ops<br/>
                WhatsApp buttons open normal chat (wa.me). No Business API required.
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function send(input: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  const from =
    process.env.EMAIL_FROM || `${BRAND.name} <onboarding@resend.dev>`;

  if (!resend) {
    console.log("[email:dev]", input.subject, "→", input.to);
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

  const rows = [
    ["Name", lead.name],
    ["Phone", lead.phone],
    ["City", lead.cityInterested],
    ["Source", lead.source],
  ];
  if (lead.boardId) rows.push(["Board", lead.boardId]);
  if (lead.quoteTotal != null) {
    rows.push([
      "Quote",
      `${lead.quoteTotal.toLocaleString()}${
        lead.quoteMonths ? ` · ${lead.quoteMonths} mo` : ""
      }`,
    ]);
  }

  const detailRows = rows
    .map(
      ([k, v], i) => `
      <tr>
        <td style="padding:10px 14px;border-top:${i === 0 ? "none" : `1px solid ${C.border}`};font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${C.muted};width:110px;vertical-align:top;">${esc(k)}</td>
        <td style="padding:10px 14px;border-top:${i === 0 ? "none" : `1px solid ${C.border}`};font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${C.text};font-weight:600;">${esc(v)}</td>
      </tr>`
    )
    .join("");

  const bodyHtml = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.card};border:1px solid ${C.border};">
      ${detailRows}
    </table>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:18px;">
      <tr>
        <td style="padding-right:8px;">${btn(chatClient, "WhatsApp lead", C.green, C.white)}</td>
        <td>${btn(`${base}/admin/leads`, "Open leads")}</td>
      </tr>
    </table>
  `;

  await send({
    to,
    subject: `New lead — ${lead.name} (${lead.source})`,
    html: wrapEmail({
      preheader: `${lead.name} from ${lead.cityInterested} · ${lead.source}`,
      title: "New website lead",
      subtitle: "Someone reached out from the public site. Follow up while it’s hot.",
      bodyHtml,
    }),
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

  const stats = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:22px;">
      <tr>
        ${[
          ["Boards synced", String(input.boardsSynced)],
          ["Ending soon", String(input.endingSoon.length)],
          ["New leads", String(input.newLeads.length)],
          ["Stale leads", String(input.staleLeads.length)],
        ]
          .map(
            ([label, value]) => `
          <td width="25%" style="padding:2px;">
            <div style="background:${C.card};border:1px solid ${C.border};padding:12px 10px;text-align:center;">
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:700;color:${C.amber};line-height:1;">${esc(value)}</div>
              <div style="margin-top:6px;font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:${C.muted};">${esc(label)}</div>
            </div>
          </td>`
          )
          .join("")}
      </tr>
    </table>
  `;

  const endingBlock =
    input.endingSoon.length === 0
      ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${emptyRow("No bookings ending in the next 14 days.")}</table>`
      : `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${C.border};">
          ${input.endingSoon
            .map(
              (r, i) => `
            <tr>
              <td style="padding:12px 14px;background:${C.card};border-top:${i === 0 ? "none" : `1px solid ${C.border}`};">
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:${C.text};">${esc(r.boardLabel)}</div>
                <div style="margin-top:4px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${C.muted};">${esc(r.clientName)} · ends ${esc(r.endDate)}</div>
              </td>
              <td align="right" style="padding:12px 14px;background:${C.card};border-top:${i === 0 ? "none" : `1px solid ${C.border}`};white-space:nowrap;">
                <span style="display:inline-block;background:rgba(245,158,11,0.15);color:${C.amber};font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;padding:4px 8px;">${r.daysLeft}d left</span>
              </td>
            </tr>`
            )
            .join("")}
        </table>`;

  const leadsBlock =
    input.newLeads.length === 0
      ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${emptyRow("No new leads in the last 24 hours.")}</table>`
      : `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${C.border};">
          ${input.newLeads
            .map((l, i) => {
              const wa = whatsappLink(
                l.phone,
                `Hi ${l.name}, this is ${BRAND.name}.`
              );
              return `
            <tr>
              <td style="padding:12px 14px;background:${C.card};border-top:${i === 0 ? "none" : `1px solid ${C.border}`};">
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:${C.text};">${esc(l.name)}</div>
                <div style="margin-top:4px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${C.muted};">${esc(l.phone)} · ${esc(l.city)} · ${esc(l.source)}</div>
              </td>
              <td align="right" style="padding:12px 14px;background:${C.card};border-top:${i === 0 ? "none" : `1px solid ${C.border}`};">
                ${btn(wa, "WhatsApp", C.green, C.white)}
              </td>
            </tr>`;
            })
            .join("")}
        </table>`;

  const staleBlock =
    input.staleLeads.length === 0
      ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${emptyRow("No stale NEW leads. Nice work.")}</table>`
      : `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${C.border};">
          ${input.staleLeads
            .map((l, i) => {
              const wa = whatsappLink(
                l.phone,
                `Hi ${l.name}, following up from ${BRAND.name}.`
              );
              return `
            <tr>
              <td style="padding:12px 14px;background:${C.card};border-top:${i === 0 ? "none" : `1px solid ${C.border}`};">
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:${C.text};">${esc(l.name)}</div>
                <div style="margin-top:4px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${C.muted};">${esc(l.phone)} · ${esc(l.city)} · waiting ~${l.ageHours}h</div>
              </td>
              <td align="right" style="padding:12px 14px;background:${C.card};border-top:${i === 0 ? "none" : `1px solid ${C.border}`};">
                ${btn(wa, "Follow up", C.green, C.white)}
              </td>
            </tr>`;
            })
            .join("")}
        </table>`;

  const bodyHtml = `
    ${stats}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:18px;">
      ${sectionTitle("Bookings ending ≤14 days")}
      <tr><td>${endingBlock}</td></tr>
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:18px;">
      ${sectionTitle("New leads (24h)")}
      <tr><td>${leadsBlock}</td></tr>
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:22px;">
      ${sectionTitle("Stale NEW leads (>48h)")}
      <tr><td>${staleBlock}</td></tr>
    </table>
    <table role="presentation" cellpadding="0" cellspacing="0">
      <tr><td>${btn(`${base}/admin`, "Open dashboard")}</td></tr>
    </table>
  `;

  await send({
    to,
    subject: `${BRAND.name} daily ops — ${input.endingSoon.length} ending, ${input.newLeads.length} new leads`,
    html: wrapEmail({
      preheader: `${input.boardsSynced} boards synced · ${input.endingSoon.length} ending soon · ${input.newLeads.length} new leads`,
      title: "Daily ops digest",
      subtitle: "Your outdoor inventory and sales pulse for today.",
      bodyHtml,
    }),
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
