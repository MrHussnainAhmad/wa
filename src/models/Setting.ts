import mongoose, { Schema, models, model, type InferSchemaType } from "mongoose";

const SettingSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: "app" },
    designFee: { type: Number, required: true, default: 15000 },
    currency: { type: String, required: true, default: "PKR" },
    whatsappNumber: { type: String, required: true, default: "923001234567" },
    durationMultipliers: {
      type: Schema.Types.Mixed,
      default: { "1": 1, "3": 0.95, "6": 0.9, "12": 0.85 },
    },
    typeMultipliers: {
      type: Schema.Types.Mixed,
      default: { static: 1, digital: 1.15 },
    },

    // WhatsApp Cloud API
    waApiEnabled: { type: Boolean, default: false },
    waAccessToken: { type: String, default: "" },
    waPhoneNumberId: { type: String, default: "" },
    waApiVersion: { type: String, default: "v21.0" },

    // Safe automation (admin-controlled)
    waAutoEnabled: { type: Boolean, default: false },
    waAutoDelayMinutes: { type: Number, default: 30 },
    waAutoMaxPerRun: { type: Number, default: 3 },
    waAutoMaxPerDay: { type: Number, default: 40 },
    waAutoMinSecondsBetween: { type: Number, default: 20 },
    waTemplateName: { type: String, default: "" },
    waTemplateLanguage: { type: String, default: "en" },
    /** Human preview / notes. Template body params use name, city, source in order. */
    waMessageNote: {
      type: String,
      default:
        "Hi {{name}}, thanks for contacting Waqas Advertisers about {{city}}. We'll follow up shortly.",
    },
  },
  { timestamps: true }
);

export type SettingDocument = InferSchemaType<typeof SettingSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Setting = models.Setting || model("Setting", SettingSchema);
