import { Schema, models, model } from "mongoose";

const UpcomingMatchSchema = new Schema(
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
    matchStartAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

export const UpcomingMatch =
  models.UpcomingMatch || model("UpcomingMatch", UpcomingMatchSchema);

