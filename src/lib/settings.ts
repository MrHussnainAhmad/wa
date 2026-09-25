import { connectDB } from "@/lib/db";
import { Setting } from "@/models";
import type { DurationMultipliers, TypeMultipliers } from "@/types";

export const DEFAULT_SETTINGS = {
  designFee: 15000,
  currency: "PKR",
  whatsappNumber: "923001234567",
  durationMultipliers: {
    "1": 1,
    "3": 0.95,
    "6": 0.9,
    "12": 0.85,
  } as DurationMultipliers,
  typeMultipliers: { static: 1, digital: 1.15 } as TypeMultipliers,
  waApiEnabled: false,
  waAccessToken: "",
  waPhoneNumberId: "",
  waApiVersion: "v21.0",
  waAutoEnabled: false,
  waAutoDelayMinutes: 30,
  waAutoMaxPerRun: 3,
  waAutoMaxPerDay: 40,
  waAutoMinSecondsBetween: 20,
  waTemplateName: "",
  waTemplateLanguage: "en",
  waMessageNote:
    "Hi {{name}}, thanks for contacting Waqas Advertisers about {{city}}. We'll follow up shortly.",
};

export async function getSettings() {
  await connectDB();

  let setting = await Setting.findOne({ key: "app" });
  if (!setting) {
    setting = await Setting.create({ key: "app", ...DEFAULT_SETTINGS });
  }

  return {
    id: String(setting._id),
    designFee: setting.designFee,
    currency: setting.currency,
    whatsappNumber: setting.whatsappNumber,
    durationMultipliers: setting.durationMultipliers as DurationMultipliers,
    typeMultipliers: setting.typeMultipliers as TypeMultipliers,
    waApiEnabled: Boolean(setting.waApiEnabled),
    waAccessToken: setting.waAccessToken || "",
    waPhoneNumberId: setting.waPhoneNumberId || "",
    waApiVersion: setting.waApiVersion || "v21.0",
    waAutoEnabled: Boolean(setting.waAutoEnabled),
    waAutoDelayMinutes: setting.waAutoDelayMinutes ?? 30,
    waAutoMaxPerRun: setting.waAutoMaxPerRun ?? 3,
    waAutoMaxPerDay: setting.waAutoMaxPerDay ?? 40,
    waAutoMinSecondsBetween: setting.waAutoMinSecondsBetween ?? 20,
    waTemplateName: setting.waTemplateName || "",
    waTemplateLanguage: setting.waTemplateLanguage || "en",
    waMessageNote:
      setting.waMessageNote || DEFAULT_SETTINGS.waMessageNote,
    waTokenSet: Boolean(setting.waAccessToken),
  };
}
