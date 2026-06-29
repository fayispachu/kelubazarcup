import { Schema, models, model } from "mongoose";

const TeamSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    logoUrl: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

export const Team = models.Team || model("Team", TeamSchema);
