import { connectDB } from "@/lib/db";
import { Setting } from "@/models";
import type { DurationMultipliers, TypeMultipliers } from "@/types";

export const DEFAULT_SETTINGS = {
  designFee: 15000,
  currency: "PKR",
  whatsappNumber: "923001234567",
  durationMultipliers: { "1": 1, "3": 0.95, "6": 0.9, "12": 0.85 } as DurationMultipliers,
  typeMultipliers: { static: 1, digital: 1.15 } as TypeMultipliers,
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
  };
}
