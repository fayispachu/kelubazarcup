import { Schema, models, model } from "mongoose";

const AdminSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      default: "Administrator",
      trim: true,
    },
  },
  { timestamps: true },
);

export const Admin = models.Admin || model("Admin", AdminSchema);
