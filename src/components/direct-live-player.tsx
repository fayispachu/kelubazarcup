"use client";

import { Loader2, Radio } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export function DirectLivePlayer({
  sessionId,
  isLive,
}: {
  sessionId: string;
  isLive: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState("Connecting to live broadcast");
  const [hasStream, setHasStream] = useState(false);

  useEffect(() => {
    if (!isLive || !sessionId) {
      setHasStream(false);
      setStatus("Live stream will start soon");
      return;
    }

    let cancelled = false;
    let answerApplied = false;
    let broadcasterCandidateIndex = 0;
    let pollId: number | undefined;
    const viewerId = `viewer_${crypto.randomUUID()}`;
    const peer = new RTCPeerConnection(ICE_SERVERS);
    const remoteStream = new MediaStream();

    async function postCandidate(candidate: RTCIceCandidate) {
      await fetch("/api/broadcast/candidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          viewerId,
          candidate: candidate.toJSON(),
        }),
      }).catch(() => null);
    }

    async function pollAnswer() {
      const response = await fetch(
        `/api/broadcast/viewer?sessionId=${encodeURIComponent(sessionId)}&viewerId=${encodeURIComponent(viewerId)}`,
        { cache: "no-store" },
      );
      if (!response.ok || cancelled) return;

      const payload = (await response.json()) as {
        active: boolean;
        answer?: RTCSessionDescriptionInit | null;
        broadcasterCandidates?: RTCIceCandidateInit[];
      };

      if (!payload.active) {
        setStatus("Live stream will start soon");
        return;
      }

      if (payload.answer && !answerApplied) {
        await peer.setRemoteDescription(new RTCSessionDescription(payload.answer));
        answerApplied = true;
        setStatus("Receiving live broadcast");
      }

      const candidates = payload.broadcasterCandidates ?? [];
      for (const candidate of candidates.slice(broadcasterCandidateIndex)) {
        await peer.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => null);
      }
      broadcasterCandidateIndex = candidates.length;
    }

    async function connect() {
      setStatus("Connecting to live broadcast");
      peer.addTransceiver("video", { direction: "recvonly" });
      peer.addTransceiver("audio", { direction: "recvonly" });

      peer.ontrack = (event) => {
        event.streams[0]?.getTracks().forEach((track) => {
          if (!remoteStream.getTracks().some((existingTrack) => existingTrack.id === track.id)) {
            remoteStream.addTrack(track);
          }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = remoteStream;
        }

        setHasStream(true);
        setStatus("Live");
      };

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          void postCandidate(event.candidate);
        }
      };

      peer.onconnectionstatechange = () => {
        if (peer.connectionState === "failed" || peer.connectionState === "disconnected") {
          setStatus("Reconnecting to broadcast");
        }
      };

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      const offerResponse = await fetch("/api/broadcast/offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          viewerId,
          offer: peer.localDescription?.toJSON(),
        }),
      });

      if (!offerResponse.ok) {
        setStatus("Live stream will start soon");
        return;
      }

      await pollAnswer();
      pollId = window.setInterval(() => {
        void pollAnswer();
      }, 1500);
    }

    void connect().catch(() => {
      if (!cancelled) {
        setStatus("Could not connect to live broadcast");
      }
    });

    return () => {
      cancelled = true;
      if (pollId) window.clearInterval(pollId);
      peer.close();
      remoteStream.getTracks().forEach((track) => track.stop());
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [isLive, sessionId]);

  return (
    <div className="relative h-full w-full bg-zinc-950">
      <video
        ref={videoRef}
        className="h-full w-full bg-zinc-950 object-contain"
        autoPlay
        controls
        playsInline
      />
      {!hasStream ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-zinc-950 px-6 text-center text-white">
          {isLive ? (
            <Loader2 size={44} className="animate-spin text-zinc-500" />
          ) : (
            <Radio size={44} className="text-zinc-500" />
          )}
          <div>
            <p className="text-xl font-semibold">{status}</p>
            <p className="mt-2 text-sm text-zinc-400">
              Keep this page open while the admin starts the direct broadcast.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
