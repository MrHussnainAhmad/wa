import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { updateSettings } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") redirect("/admin");

  const settings = await getSettings();
  const d = settings.durationMultipliers;
  const t = settings.typeMultipliers;

  return (
    <div className="space-y-6">
      <header className="border-b border-stone-800 pb-4">
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-white">
          Settings
        </h1>
        <p className="mt-1 text-sm text-stone-400">
          Company defaults used in quotes and WhatsApp.
        </p>
      </header>

      <form
        action={async (fd) => {
          "use server";
          await updateSettings(fd);
        }}
        className="max-w-lg space-y-8"
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
            <p className="mt-1 text-xs text-stone-500">
              Fixed fee added to every quote.
            </p>
          </div>
          <div>
            <Label>Currency code</Label>
            <Input name="currency" defaultValue={settings.currency} required />
          </div>
          <div>
            <Label>WhatsApp number</Label>
            <Input
              name="whatsappNumber"
              defaultValue={settings.whatsappNumber}
              required
              placeholder="923001234567"
            />
            <p className="mt-1 text-xs text-stone-500">
              Digits only, with country code (no + or spaces).
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-500">
            Duration discounts
          </h2>
          <p className="text-xs text-stone-500">
            1.00 = full price. 0.90 = 10% off for that booking length.
          </p>
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
          <p className="text-xs text-stone-500">
            Multiplies the board monthly price. Digital is often a bit higher.
          </p>
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

        <Button type="submit">Save settings</Button>
      </form>
    </div>
  );
}
