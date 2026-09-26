import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { auth } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { getSiteUrl } from "@/lib/site";
import { updateSettings } from "@/app/admin/actions";
import { SiteQrCard } from "@/components/admin/SiteQrCard";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") redirect("/admin");

  const settings = await getSettings();
  const d = settings.durationMultipliers;
  const t = settings.typeMultipliers;
  const siteUrl = getSiteUrl();
  const qrDataUrl = await QRCode.toDataURL(siteUrl, {
    width: 360,
    margin: 2,
    errorCorrectionLevel: "M",
    color: { dark: "#1c1917", light: "#ffffff" },
  });

  return (
    <div className="space-y-6">
      <header className="border-b border-stone-800 pb-4">
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-white">
          Settings
        </h1>
        <p className="mt-1 text-sm text-stone-400">
          Company defaults, rates, website QR, and safe WhatsApp automation.
        </p>
      </header>

      <SiteQrCard siteUrl={siteUrl} qrDataUrl={qrDataUrl} />

      <form
        action={async (fd) => {
          "use server";
          await updateSettings(fd);
        }}
        className="max-w-xl space-y-10"
      >
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-500">
            Company
          </h2>
          <div>
            <Label>Design fee</Label>
            <Input
              name="designFee"
              type="number"
              step="1"
              defaultValue={settings.designFee}
              required
            />
          </div>
          <div>
            <Label>Currency code</Label>
            <Input name="currency" defaultValue={settings.currency} required />
          </div>
          <div>
            <Label>Public WhatsApp number (wa.me links)</Label>
            <Input
              name="whatsappNumber"
              defaultValue={settings.whatsappNumber}
              required
              placeholder="923001234567"
            />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-500">
            Duration discounts
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>1 month</Label>
              <Input
                name="duration_1"
                type="number"
                step="0.01"
                defaultValue={d["1"] ?? 1}
                required
              />
            </div>
            <div>
              <Label>3 months</Label>
              <Input
                name="duration_3"
                type="number"
                step="0.01"
                defaultValue={d["3"] ?? 0.95}
                required
              />
            </div>
            <div>
              <Label>6 months</Label>
              <Input
                name="duration_6"
                type="number"
                step="0.01"
                defaultValue={d["6"] ?? 0.9}
                required
              />
            </div>
            <div>
              <Label>12 months</Label>
              <Input
                name="duration_12"
                type="number"
                step="0.01"
                defaultValue={d["12"] ?? 0.85}
                required
              />
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-500">
            Board type rates
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Static boards</Label>
              <Input
                name="type_static"
                type="number"
                step="0.01"
                defaultValue={t.static ?? 1}
                required
              />
            </div>
            <div>
              <Label>Digital boards</Label>
              <Input
                name="type_digital"
                type="number"
                step="0.01"
                defaultValue={t.digital ?? 1.15}
                required
              />
            </div>
          </div>
        </section>

        <section className="space-y-4 border-t border-stone-800 pt-8">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-500">
              WhatsApp Cloud API
            </h2>
            <p className="mt-2 text-xs text-stone-500">
              Paste credentials from Meta Developer → WhatsApp → API Setup.
              First outbound messages need an <strong className="text-stone-300">approved template</strong>.
              Automation is off until you enable it below.
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm text-stone-200">
            <input
              type="checkbox"
              name="waApiEnabled"
              defaultChecked={settings.waApiEnabled}
              className="size-4 accent-amber-500"
            />
            Enable WhatsApp Cloud API
          </label>

          <div>
            <Label>Access token</Label>
            <Input
              name="waAccessToken"
              type="password"
              autoComplete="off"
              placeholder={
                settings.waTokenSet
                  ? "Saved — leave blank to keep current token"
                  : "Paste permanent system-user token"
              }
            />
          </div>
          <div>
            <Label>Phone number ID</Label>
            <Input
              name="waPhoneNumberId"
              defaultValue={settings.waPhoneNumberId}
              placeholder="From API Setup panel"
            />
          </div>
          <div>
            <Label>API version</Label>
            <Input
              name="waApiVersion"
              defaultValue={settings.waApiVersion}
              placeholder="v21.0"
            />
          </div>
        </section>

        <section className="space-y-4 border-t border-stone-800 pt-8">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-500">
              Lead follow-up automation
            </h2>
            <p className="mt-2 text-xs text-stone-500">
              When a lead comes in, a message is <strong className="text-stone-300">queued</strong> —
              not sent instantly. A slow cron sends a few at a time with gaps.
              Hard caps prevent blasting (max 5/run, 100/day, ≥15s between messages).
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm text-stone-200">
            <input
              type="checkbox"
              name="waAutoEnabled"
              defaultChecked={settings.waAutoEnabled}
              className="size-4 accent-amber-500"
            />
            Enable automatic follow-up for new leads
          </label>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Wait before send (minutes)</Label>
              <Input
                name="waAutoDelayMinutes"
                type="number"
                min={5}
                max={1440}
                defaultValue={settings.waAutoDelayMinutes}
                required
              />
            </div>
            <div>
              <Label>Seconds between each send</Label>
              <Input
                name="waAutoMinSecondsBetween"
                type="number"
                min={15}
                max={300}
                defaultValue={settings.waAutoMinSecondsBetween}
                required
              />
            </div>
            <div>
              <Label>Max sends per cron run</Label>
              <Input
                name="waAutoMaxPerRun"
                type="number"
                min={1}
                max={5}
                defaultValue={settings.waAutoMaxPerRun}
                required
              />
            </div>
            <div>
              <Label>Max sends per day</Label>
              <Input
                name="waAutoMaxPerDay"
                type="number"
                min={1}
                max={100}
                defaultValue={settings.waAutoMaxPerDay}
                required
              />
            </div>
          </div>

          <div>
            <Label>Approved template name</Label>
            <Input
              name="waTemplateName"
              defaultValue={settings.waTemplateName}
              placeholder="e.g. lead_thanks"
            />
            <p className="mt-1 text-xs text-stone-500">
              Must exist in WhatsApp Manager and be approved. Body variables
              sent in order: <span className="text-stone-300">name → city → source</span>.
            </p>
          </div>
          <div>
            <Label>Template language code</Label>
            <Input
              name="waTemplateLanguage"
              defaultValue={settings.waTemplateLanguage}
              placeholder="en"
            />
          </div>
          <div>
            <Label>Message note (for your team — not sent as free text)</Label>
            <Textarea
              name="waMessageNote"
              rows={3}
              defaultValue={settings.waMessageNote}
              placeholder="Hi {{name}}, thanks for contacting us about {{city}}…"
            />
            <p className="mt-1 text-xs text-stone-500">
              Reminder of what your Meta template should say. Actual send uses the
              approved template + name/city/source params.
            </p>
          </div>

          <div className="border border-stone-800 bg-stone-900/40 p-3 text-xs text-stone-400">
            Cron URL: <code className="text-stone-200">/api/cron/whatsapp-queue</code>
            <br />
            Header: <code className="text-stone-200">x-cron-secret</code>
            <br />
            Suggested schedule: every 10–15 minutes.
          </div>
        </section>

        <Button type="submit">Save settings</Button>
      </form>
    </div>
  );
}
