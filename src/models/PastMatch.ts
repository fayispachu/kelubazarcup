import { Schema, models, model } from "mongoose";

const PastMatchSchema = new Schema(
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

    homeScore: {
      type: Number,
      default: 0,
      min: 0,
    },
    awayScore: {
      type: Number,
      default: 0,
      min: 0,
    },

    matchStartAt: {
      type: Date,
      default: null,
    },
    matchEndAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

export const PastMatch =
  models.PastMatch || model("PastMatch", PastMatchSchema);

