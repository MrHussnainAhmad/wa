import mongoose, { Schema, models, model, type InferSchemaType } from "mongoose";

const FaqSchema = new Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    active: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export type FaqDocument = InferSchemaType<typeof FaqSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Faq = models.Faq || model("Faq", FaqSchema);
