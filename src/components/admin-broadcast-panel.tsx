"use client";

import { Camera, Loader2, MonitorUp, Music, Radio, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useLiveState } from "@/hooks/use-live-state";

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

type BroadcastPeer = {
  viewerId: string;
  offer: RTCSessionDescriptionInit | null;
  answer?: RTCSessionDescriptionInit | null;
  viewerCandidates: RTCIceCandidateInit[];
};

function buttonClassName(variant: "primary" | "secondary" | "danger" = "secondary") {
  const base =
    "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60";

  if (variant === "primary") return `${base} bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200`;
  if (variant === "danger") return `${base} bg-red-600 text-white hover:bg-red-700`;
  return `${base} border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800`;
}

export function AdminBroadcastPanel({
  isLive,
  sessionId,
  onStart,
  onStop,
}: {
  isLive: boolean;
  sessionId: string;
  onStart: (sessionId: string) => Promise<void>;
  onStop: () => Promise<void>;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef("");
  const pollRef = useRef<number | null>(null);
  const pollingRef = useRef(false);
  const peersRef = useRef(new Map<string, RTCPeerConnection>());
  const candidateIndexRef = useRef(new Map<string, number>());
  const [status, setStatus] = useState("Ready to broadcast");
  const [viewerCount, setViewerCount] = useState(0);
  const [isStarting, setIsStarting] = useState(false);
  const [hasLocalStream, setHasLocalStream] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [isTogglingMusic, setIsTogglingMusic] = useState(false);
  const state = useLiveState((store) => store.state);

  async function postBroadcasterCandidate(
    activeSessionId: string,
    viewerId: string,
    candidate: RTCIceCandidate,
  ) {
    await fetch("/api/admin/broadcast/candidate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: activeSessionId,
        viewerId,
        candidate: candidate.toJSON(),
      }),
    }).catch(() => null);
  }

  async function answerPeer(peerPayload: BroadcastPeer) {
    const activeSessionId = sessionRef.current;
    const localStream = streamRef.current;

    if (!activeSessionId || !localStream || !peerPayload.offer) return;
    if (peersRef.current.has(peerPayload.viewerId)) return;

    const peer = new RTCPeerConnection(ICE_SERVERS);
    peersRef.current.set(peerPayload.viewerId, peer);
    candidateIndexRef.current.set(peerPayload.viewerId, 0);

    localStream.getTracks().forEach((track) => {
      peer.addTrack(track, localStream);
    });

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        void postBroadcasterCandidate(activeSessionId, peerPayload.viewerId, event.candidate);
      }
    };

    peer.onconnectionstatechange = () => {
      if (["closed", "failed", "disconnected"].includes(peer.connectionState)) {
        peersRef.current.delete(peerPayload.viewerId);
        candidateIndexRef.current.delete(peerPayload.viewerId);
        peer.close();
      }
      setViewerCount(peersRef.current.size);
    };

    await peer.setRemoteDescription(new RTCSessionDescription(peerPayload.offer));
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    await fetch("/api/admin/broadcast/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: activeSessionId,
        viewerId: peerPayload.viewerId,
        answer: peer.localDescription?.toJSON(),
      }),
    });
  }

  async function addViewerCandidates(peerPayload: BroadcastPeer) {
    const peer = peersRef.current.get(peerPayload.viewerId);
    if (!peer) return;

    const currentIndex = candidateIndexRef.current.get(peerPayload.viewerId) ?? 0;
    const candidates = peerPayload.viewerCandidates ?? [];

    for (const candidate of candidates.slice(currentIndex)) {
      await peer.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => null);
    }

    candidateIndexRef.current.set(peerPayload.viewerId, candidates.length);
  }

  async function pollPeers() {
    if (pollingRef.current || !sessionRef.current || !streamRef.current) return;

    pollingRef.current = true;
    try {
      const response = await fetch(
        `/api/admin/broadcast/peers?sessionId=${encodeURIComponent(sessionRef.current)}`,
        { cache: "no-store" },
      );
      if (!response.ok) return;

      const payload = (await response.json()) as { peers: BroadcastPeer[] };
      for (const peerPayload of payload.peers) {
        await answerPeer(peerPayload);
        await addViewerCandidates(peerPayload);
      }

      setViewerCount(peersRef.current.size);
    } finally {
      pollingRef.current = false;
    }
  }

  function startPolling() {
    if (pollRef.current) window.clearInterval(pollRef.current);
    void pollPeers();
    pollRef.current = window.setInterval(() => {
      void pollPeers();
    }, 1500);
  }

  function closeConnections() {
    if (pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }

    peersRef.current.forEach((peer) => peer.close());
    peersRef.current.clear();
    candidateIndexRef.current.clear();
    setViewerCount(0);
  }

  function stopLocalStream() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setHasLocalStream(false);

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }

  async function applyHdConstraints(stream: MediaStream) {
    const videoTracks = stream.getVideoTracks();

    await Promise.all(
      videoTracks.map(async (track) => {
        try {
          await track.applyConstraints({
            width: { ideal: 1920, max: 1920 },
            height: { ideal: 1080, max: 1080 },
            frameRate: { ideal: 30, max: 60 },
          });
        } catch {
          // Ignore unsupported constraints and keep the stream available.
        }
      }),
    );
  }

  async function getCameraStream() {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: {
        width: { ideal: 1920, max: 1920 },
        height: { ideal: 1080, max: 1080 },
        frameRate: { ideal: 30, max: 60 },
        facingMode: "environment",
      },
    });

    await applyHdConstraints(stream);
    return stream;
  }

  async function getScreenStream() {
    const displayStream = await navigator.mediaDevices.getDisplayMedia({
      audio: true,
      video: {
        width: { ideal: 1920, max: 1920 },
        height: { ideal: 1080, max: 1080 },
        frameRate: { ideal: 30, max: 60 },
      },
    });

    await applyHdConstraints(displayStream);

    if (displayStream.getAudioTracks().length > 0) {
      return displayStream;
    }

    try {
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStream.getAudioTracks().forEach((track) => displayStream.addTrack(track));
    } catch {
      // Screen video still works if the browser or device denies microphone capture.
    }

    return displayStream;
  }

  async function startBroadcast(source: "camera" | "screen") {
    setIsStarting(true);
    setStatus(source === "camera" ? "Opening camera" : "Opening screen share");
    closeConnections();
    stopLocalStream();

    try {
      const stream = source === "camera" ? await getCameraStream() : await getScreenStream();
      const nextSessionId = crypto.randomUUID();
      streamRef.current = stream;
      sessionRef.current = nextSessionId;
      setHasLocalStream(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      stream.getVideoTracks()[0]?.addEventListener("ended", () => {
        void stopBroadcast();
      });

      await onStart(nextSessionId);
      setStatus("Broadcasting live");
      startPolling();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Could not start broadcast";
      setStatus(errorMessage);
      stopLocalStream();
      sessionRef.current = "";
    } finally {
      setIsStarting(false);
    }
  }

  async function stopBroadcast() {
    setStatus("Ending broadcast");
    closeConnections();
    stopLocalStream();
    sessionRef.current = "";
    await onStop();
    setStatus("Ready to broadcast");
  }

  async function toggleMusic() {
    setIsTogglingMusic(true);
    try {
      const response = await fetch("/api/admin/broadcast/music", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ musicEnabled: !musicEnabled }),
      });

      if (response.ok) {
        const data = await response.json();
        setMusicEnabled(data.musicEnabled);
      }
    } catch (error) {
      console.error("Error toggling music:", error);
    } finally {
      setIsTogglingMusic(false);
    }
  }

  useEffect(() => {
    // Ensure the video element has the current stream
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [hasLocalStream]);

  useEffect(() => {
    sessionRef.current = sessionId;
  }, [sessionId]);

  useEffect(() => {
    if (state?.liveMatch) {
      setMusicEnabled(state.liveMatch.musicEnabled ?? false);
    }
  }, [state?.liveMatch]);

  useEffect(() => {
    return () => {
      closeConnections();
      stopLocalStream();
    };
  }, []);

  return (
    <section className="rounded-md border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Direct Broadcast
          </p>
          <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
            Go live from this website
          </h2>
        </div>
        <span className="inline-flex items-center gap-2 rounded-sm bg-zinc-100 px-2.5 py-1 text-xs font-bold text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          <Radio size={14} /> {viewerCount} viewers
        </span>
      </div>

      <div className="overflow-hidden rounded-md border border-zinc-200 bg-zinc-950 dark:border-zinc-800">
        <div className="aspect-video">
          {hasLocalStream ? (
            <video
              ref={videoRef}
              className="h-full w-full object-contain"
              autoPlay
              muted
              playsInline
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-white">
              {isStarting ? (
                <Loader2 size={38} className="animate-spin text-zinc-500" />
              ) : (
                <Camera size={38} className="text-zinc-500" />
              )}
              <p className="text-base font-semibold">{status}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          className={buttonClassName("primary")}
          type="button"
          onClick={() => void startBroadcast("camera")}
          disabled={isStarting}
        >
          <Camera size={16} /> Camera live
        </button>
        <button
          className={buttonClassName()}
          type="button"
          onClick={() => void startBroadcast("screen")}
          disabled={isStarting}
        >
          <MonitorUp size={16} /> Screen live
        </button>
        <button
          className={buttonClassName("danger")}
          type="button"
          onClick={() => void stopBroadcast()}
          disabled={isStarting || (!isLive && !hasLocalStream)}
        >
          <Square size={16} /> End live
        </button>
        <button
          className={buttonClassName(isLive && musicEnabled ? "danger" : "secondary")}
          type="button"
          onClick={() => void toggleMusic()}
          disabled={isTogglingMusic || !isLive}
        >
          <Music size={16} />
          {isLive && musicEnabled ? "Stop music" : "Play music"}
        </button>
      </div>

      <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
        Keep this admin page open while broadcasting. Camera and microphone access must be allowed by the browser.
      </p>
    </section>
  );
}
