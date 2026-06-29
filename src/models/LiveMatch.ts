import { Schema, models, model } from "mongoose";

const LiveMatchSchema = new Schema(
  {
    streamUrl: {
      type: String,
      default: "",
      trim: true,
    },
    broadcastSessionId: {
      type: String,
      default: "",
      trim: true,
    },
    homeTeam: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },
    awayTeam: {
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
    minute: {
      type: String,
      default: "0'",
      trim: true,
    },
    phase: {
      type: String,
      default: "NOT_STARTED",
      enum: ["NOT_STARTED", "PAUSED"],
    },
    countdownEndsAt: {
      type: Date,
      default: null,
    },
    countdownDurationSeconds: {
      type: Number,
      default: 0,
      min: 0,
    },
    isLive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const LiveMatch =
  models.LiveMatch || model("LiveMatch", LiveMatchSchema);
