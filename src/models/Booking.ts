import mongoose, { Schema, models, model, type InferSchemaType } from "mongoose";

const BookingSchema = new Schema(
  {
    boardId: {
      type: Schema.Types.ObjectId,
      ref: "Board",
      required: true,
      index: true,
    },
    clientName: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    agreedPrice: { type: Number, required: true },
    depositStatus: {
      type: String,
      enum: ["PENDING", "PAID"],
      default: "PENDING",
    },
    contractFileUrl: { type: String, default: null },
    createdById: {
      type: Schema.Types.ObjectId,
      ref: "AdminUser",
      required: true,
    },
  },
  { timestamps: true }
);

BookingSchema.index({ boardId: 1, startDate: 1, endDate: 1 });

export type BookingDocument = InferSchemaType<typeof BookingSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Booking = models.Booking || model("Booking", BookingSchema);
