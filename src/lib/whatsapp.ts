import { connectDB } from "@/lib/db";
import { WhatsAppOutbox } from "@/models";
import { normalizeWhatsAppPhone } from "@/lib/utils";
import { getSettings } from "@/lib/settings";

const HARD_MAX_PER_RUN = 5;
const HARD_MAX_PER_DAY = 100;
const HARD_MIN_SECONDS = 15;

export async function enqueueLeadWhatsApp(input: {
  leadId: string;
  phone: string;
  name: string;
  city: string;
  source: string;
}) {
  const settings = await getSettings();

  if (!settings.waApiEnabled || !settings.waAutoEnabled) return null;
  if (!settings.waAccessToken || !settings.waPhoneNumberId) return null;
  if (!settings.waTemplateName.trim()) return null;

  const phone = normalizeWhatsAppPhone(input.phone);
  if (phone.length < 10) return null;

  // Don't stack duplicates for same lead while pending
  const existing = await WhatsAppOutbox.findOne({
    leadId: input.leadId,
    status: "PENDING",
  });
  if (existing) return existing;

  const delay = Math.max(5, Math.min(24 * 60, settings.waAutoDelayMinutes || 30));
  const sendAt = new Date(Date.now() + delay * 60_000);

  return WhatsAppOutbox.create({
    leadId: input.leadId,
    phone,
    name: input.name,
    city: input.city,
    source: input.source,
    status: "PENDING",
    sendAt,
  });
}

async function countSentToday() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return WhatsAppOutbox.countDocuments({
    status: "SENT",
    sentAt: { $gte: start },
  });
}

async function sendTemplateMessage(input: {
  token: string;
  phoneNumberId: string;
  apiVersion: string;
  to: string;
  templateName: string;
  language: string;
  bodyParams: string[];
}) {
  const url = `https://graph.facebook.com/${input.apiVersion}/${input.phoneNumberId}/messages`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: input.to,
      type: "template",
      template: {
        name: input.templateName,
        language: { code: input.language || "en" },
        components: [
          {
            type: "body",
            parameters: input.bodyParams.map((text) => ({
              type: "text",
              text: text.slice(0, 1024) || "-",
            })),
          },
        ],
      },
    }),
  });

  const data = (await res.json()) as {
    messages?: Array<{ id: string }>;
    error?: { message?: string };
  };

  if (!res.ok) {
    throw new Error(data.error?.message || `WhatsApp API ${res.status}`);
  }

  return data.messages?.[0]?.id || "";
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Process due outbox items slowly — never a blast. */
export async function processWhatsAppOutbox() {
  await connectDB();
  const settings = await getSettings();

  if (!settings.waApiEnabled || !settings.waAutoEnabled) {
    return { processed: 0, sent: 0, failed: 0, skipped: 0, reason: "disabled" };
  }
  if (!settings.waAccessToken || !settings.waPhoneNumberId || !settings.waTemplateName) {
    return {
      processed: 0,
      sent: 0,
      failed: 0,
      skipped: 0,
      reason: "missing_credentials_or_template",
    };
  }

  const maxPerRun = Math.min(
    HARD_MAX_PER_RUN,
    Math.max(1, settings.waAutoMaxPerRun || 3)
  );
  const maxPerDay = Math.min(
    HARD_MAX_PER_DAY,
    Math.max(1, settings.waAutoMaxPerDay || 40)
  );
  const gapSec = Math.max(
    HARD_MIN_SECONDS,
    settings.waAutoMinSecondsBetween || 20
  );

  const sentToday = await countSentToday();
  if (sentToday >= maxPerDay) {
    return {
      processed: 0,
      sent: 0,
      failed: 0,
      skipped: 0,
      reason: "daily_cap_reached",
      sentToday,
      maxPerDay,
    };
  }

  const remainingToday = maxPerDay - sentToday;
  const limit = Math.min(maxPerRun, remainingToday);
  const now = new Date();

  const due = await WhatsAppOutbox.find({
    status: "PENDING",
    sendAt: { $lte: now },
  })
    .sort({ sendAt: 1 })
    .limit(limit)
    .lean();

  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (let i = 0; i < due.length; i++) {
    const item = due[i];

    // Re-check daily cap mid-loop
    if ((await countSentToday()) >= maxPerDay) {
      skipped += due.length - i;
      break;
    }

    try {
      const messageId = await sendTemplateMessage({
        token: settings.waAccessToken,
        phoneNumberId: settings.waPhoneNumberId,
        apiVersion: settings.waApiVersion || "v21.0",
        to: item.phone,
        templateName: settings.waTemplateName.trim(),
        language: settings.waTemplateLanguage || "en",
        bodyParams: [item.name, item.city || "-", item.source || "-"],
      });

      await WhatsAppOutbox.findByIdAndUpdate(item._id, {
        status: "SENT",
        sentAt: new Date(),
        attempts: (item.attempts || 0) + 1,
        metaMessageId: messageId,
        lastError: "",
      });
      sent += 1;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Send failed";
      await WhatsAppOutbox.findByIdAndUpdate(item._id, {
        status: "FAILED",
        attempts: (item.attempts || 0) + 1,
        lastError: msg.slice(0, 500),
      });
      failed += 1;
      console.error("[whatsapp:outbox]", item._id, msg);
    }

    // Hard gap between sends (never burst)
    if (i < due.length - 1) {
      await sleep(gapSec * 1000);
    }
  }

  return {
    processed: due.length,
    sent,
    failed,
    skipped,
    sentToday: await countSentToday(),
    maxPerDay,
    gapSec,
  };
}

/** Cancel pending automation for a lead (optional helper). */
export async function cancelPendingWhatsApp(leadId: string) {
  await connectDB();
  await WhatsAppOutbox.updateMany(
    { leadId, status: "PENDING" },
    { status: "CANCELLED" }
  );
}

export async function getWhatsAppConfigStatus() {
  const s = await getSettings();
  return {
    apiConfigured: Boolean(s.waApiEnabled && s.waAccessToken && s.waPhoneNumberId),
    autoEnabled: s.waAutoEnabled,
    hasTemplate: Boolean(s.waTemplateName?.trim()),
    delayMinutes: s.waAutoDelayMinutes,
    maxPerRun: s.waAutoMaxPerRun,
    maxPerDay: s.waAutoMaxPerDay,
    minSecondsBetween: s.waAutoMinSecondsBetween,
  };
}
