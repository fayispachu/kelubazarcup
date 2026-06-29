import { connectDb } from "@/lib/db";
import { LiveMatch } from "@/models/LiveMatch";

export type SignalDescription = {
  type: "offer" | "answer";
  sdp: string;
};

export type SignalCandidate = {
  candidate?: string;
  sdpMid?: string | null;
  sdpMLineIndex?: number | null;
  usernameFragment?: string | null;
};

export async function getActiveBroadcastSession() {
  await connectDb();

  const liveMatch = await LiveMatch.findOne().lean<{
    isLive?: boolean;
    broadcastSessionId?: string;
  }>();

  if (!liveMatch?.isLive || !liveMatch.broadcastSessionId) {
    return null;
  }

  return liveMatch.broadcastSessionId;
}

export function isPlainDescription(value: unknown): value is SignalDescription {
  if (!value || typeof value !== "object") return false;
  const description = value as Partial<SignalDescription>;
  return (
    (description.type === "offer" || description.type === "answer") &&
    typeof description.sdp === "string"
  );
}

export function isPlainCandidate(value: unknown): value is SignalCandidate {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<SignalCandidate>;
  return typeof candidate.candidate === "string";
}

export function cleanViewerId(value: unknown) {
  return String(value ?? "")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .slice(0, 80);
}
