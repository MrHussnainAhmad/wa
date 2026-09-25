import mongoose, { Schema, models, model, type InferSchemaType } from "mongoose";

const AdminUserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["SUPER_ADMIN", "SALES_REP"],
      required: true,
      default: "SALES_REP",
    },
    name: { type: String, default: "" },
  },
  { timestamps: true }
);

export type AdminUserDocument = InferSchemaType<typeof AdminUserSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const AdminUser =
  models.AdminUser || model("AdminUser", AdminUserSchema);
