import mongoose, { Schema, models, model, type InferSchemaType } from "mongoose";

const WhatsAppOutboxSchema = new Schema(
  {
    leadId: { type: Schema.Types.ObjectId, ref: "Lead", required: true },
    phone: { type: String, required: true },
    name: { type: String, required: true },
    city: { type: String, default: "" },
    source: { type: String, default: "" },
    status: {
      type: String,
      enum: ["PENDING", "SENT", "FAILED", "CANCELLED", "SKIPPED"],
      default: "PENDING",
      index: true,
    },
    sendAt: { type: Date, required: true, index: true },
    sentAt: { type: Date, default: null },
    attempts: { type: Number, default: 0 },
    lastError: { type: String, default: "" },
    metaMessageId: { type: String, default: "" },
  },
  { timestamps: true }
);

WhatsAppOutboxSchema.index({ status: 1, sendAt: 1 });

export type WhatsAppOutboxDocument = InferSchemaType<
  typeof WhatsAppOutboxSchema
> & {
  _id: mongoose.Types.ObjectId;
};

export const WhatsAppOutbox =
  models.WhatsAppOutbox || model("WhatsAppOutbox", WhatsAppOutboxSchema);
