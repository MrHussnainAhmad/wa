import mongoose, { Schema, models, model, type InferSchemaType } from "mongoose";

const BoardPhotoSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, default: "" },
    sortOrder: { type: Number, default: 0 },
  },
  { _id: true }
);

const BoardSchema = new Schema(
  {
    city: { type: String, required: true, index: true },
    address: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    size: { type: String, required: true },
    type: { type: String, enum: ["STATIC", "DIGITAL"], required: true },
    dailyTraffic: { type: Number, required: true, default: 0 },
    pricePerMonth: { type: Number, required: true },
    status: {
      type: String,
      enum: ["AVAILABLE", "BOOKED"],
      default: "AVAILABLE",
      index: true,
    },
    bookedUntil: { type: Date, default: null },
    photos: { type: [BoardPhotoSchema], default: [] },
  },
  { timestamps: true }
);

export type BoardDocument = InferSchemaType<typeof BoardSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Board = models.Board || model("Board", BoardSchema);
