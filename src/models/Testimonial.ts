import mongoose, { Schema, models, model, type InferSchemaType } from "mongoose";

const TestimonialSchema = new Schema(
  {
    clientName: { type: String, required: true },
    company: { type: String, required: true },
    quote: { type: String, required: true },
    active: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export type TestimonialDocument = InferSchemaType<typeof TestimonialSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Testimonial =
  models.Testimonial || model("Testimonial", TestimonialSchema);
