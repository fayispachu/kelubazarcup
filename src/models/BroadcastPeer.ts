import { Schema, models, model } from "mongoose";

const CandidateSchema = new Schema({}, { _id: false, strict: false });
const DescriptionSchema = new Schema({}, { _id: false, strict: false });

const BroadcastPeerSchema = new Schema(
  {
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    viewerId: {
      type: String,
      required: true,
      index: true,
    },
    offer: {
      type: DescriptionSchema,
      default: null,
    },
    answer: {
      type: DescriptionSchema,
      default: null,
    },
    viewerCandidates: {
      type: [CandidateSchema],
      default: [],
    },
    broadcasterCandidates: {
      type: [CandidateSchema],
      default: [],
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 60 * 60 * 1000),
      expires: 0,
    },
  },
  { timestamps: true },
);

BroadcastPeerSchema.index({ sessionId: 1, viewerId: 1 }, { unique: true });

export const BroadcastPeer =
  models.BroadcastPeer || model("BroadcastPeer", BroadcastPeerSchema);
