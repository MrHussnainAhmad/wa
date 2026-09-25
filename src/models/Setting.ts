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
  },
  { timestamps: true }
);

export type SettingDocument = InferSchemaType<typeof SettingSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Setting = models.Setting || model("Setting", SettingSchema);
