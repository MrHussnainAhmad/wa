import mongoose, { Schema, models, model, type InferSchemaType } from "mongoose";

const LeadSchema = new Schema(
  {
    source: { type: String, enum: ["QUOTE", "CONTACT"], required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    cityInterested: { type: String, required: true },
    boardId: {
      type: Schema.Types.ObjectId,
      ref: "Board",
      default: null,
    },
    status: {
      type: String,
      enum: ["NEW", "CONTACTED", "WON", "LOST"],
      default: "NEW",
      index: true,
    },
    notes: { type: String, default: "" },
    quoteTotal: { type: Number, default: null },
    quoteMonths: { type: Number, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export type LeadDocument = InferSchemaType<typeof LeadSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Lead = models.Lead || model("Lead", LeadSchema);
