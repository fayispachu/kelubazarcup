import { Schema, models, model } from "mongoose";

const NextMatchSchema = new Schema(
  {
    teamOne: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },
    teamTwo: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },
    matchDate: {
      type: String,
      default: "",
      trim: true,
    },
    matchTime: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true },
);

export const NextMatch =
  models.NextMatch || model("NextMatch", NextMatchSchema);
