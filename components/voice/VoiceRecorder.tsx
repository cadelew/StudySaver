"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type RecordingState = "idle" | "recording" | "processing" | "success" | "error";

interface VoiceRecorderProps {
  onTranscript: (transcript: string) => void;
  onError?: (error: string) => void;
}

export function VoiceRecorder({ onTranscript, onError }: VoiceRecorderProps) {
  const [state, setState] = React.useState<RecordingState>("idle");
  const [transcript, setTranscript] = React.useState("");
  const [animationBars, setAnimationBars] = React.useState<number[]>(Array(20).fill(0.3));
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const chunksRef = React.useRef<Blob[]>([]);
  const animFrameRef = React.useRef<number>(0);
  const analyserRef = React.useRef<AnalyserNode | null>(null);
  const recordingRef = React.useRef(false);
  const mimeTypeRef = React.useRef("audio/webm");
  const startedAtRef = React.useRef(0);

  const animateWaveform = React.useCallback(() => {
    if (!analyserRef.current) return;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    const bars = Array(20).fill(0).map((_, i) => {
      const idx = Math.floor((i / 20) * dataArray.length * 0.6);
      return 0.2 + (dataArray[idx] / 255) * 0.8;
    });
    setAnimationBars(bars);
    animFrameRef.current = requestAnimationFrame(animateWaveform);
  }, []);

  const cleanupStream = React.useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    analyserRef.current = null;
    setAnimationBars(Array(20).fill(0.3));
  }, []);

  React.useEffect(() => {
    return () => {
      recordingRef.current = false;
      mediaRecorderRef.current?.stop();
      cleanupStream();
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [cleanupStream]);

  const sendAudio = React.useCallback(async (blob: Blob, mimeType: string) => {
    try {
      if (blob.size < 1000) {
        throw new Error("Recording too short. Hold the button while speaking.");
      }

      const formData = new FormData();
      formData.append("audio", blob, `recording.${mimeType.includes("webm") ? "webm" : "m4a"}`);

      const res = await fetch("/api/transcribe", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Transcription failed");

      setTranscript(data.transcript);
      setState("success");
      // Defer so mic cleanup finishes before parent re-render unmounts this component
      window.requestAnimationFrame(() => onTranscript(data.transcript));
    } catch (err) {
      console.error("Send audio error:", err);
      setState("error");
      onError?.(err instanceof Error ? err.message : "Could not transcribe audio. Try again.");
    }
  }, [onError, onTranscript]);

  const startRecording = React.useCallback(async () => {
    if (recordingRef.current || state === "processing") return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/mp4";

      mimeTypeRef.current = mimeType;

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        recordingRef.current = false;
        cleanupStream();
        setState("processing");

        const blob = new Blob(chunksRef.current, { type: mimeTypeRef.current.split(";")[0] });
        await sendAudio(blob, mimeTypeRef.current);
      };

      recorder.start();
      recordingRef.current = true;
      startedAtRef.current = Date.now();
      setState("recording");
      animFrameRef.current = requestAnimationFrame(animateWaveform);
    } catch (err) {
      console.error("Mic error:", err);
      recordingRef.current = false;
      cleanupStream();
      setState("error");
      onError?.("Microphone access denied. Please allow microphone in your browser.");
    }
  }, [animateWaveform, cleanupStream, onError, sendAudio, state]);

  const stopRecording = React.useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recordingRef.current || !recorder || recorder.state === "inactive") return;

    const elapsed = Date.now() - startedAtRef.current;
    const finish = () => {
      if (recorder.state !== "inactive") {
        recorder.requestData();
        recorder.stop();
      }
    };

    if (elapsed < 350) {
      window.setTimeout(finish, 350 - elapsed);
      return;
    }

    finish();
  }, []);

  React.useEffect(() => {
    if (state !== "recording") return;
    const onWindowPointerUp = () => stopRecording();
    window.addEventListener("pointerup", onWindowPointerUp);
    window.addEventListener("pointercancel", onWindowPointerUp);
    return () => {
      window.removeEventListener("pointerup", onWindowPointerUp);
      window.removeEventListener("pointercancel", onWindowPointerUp);
    };
  }, [stopRecording, state]);

  const reset = () => {
    recordingRef.current = false;
    cleanupStream();
    setState("idle");
    setTranscript("");
  };

  const isRecording = state === "recording";
  const isProcessing = state === "processing";

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Waveform */}
      <div className="flex items-center gap-1 h-16 w-full max-w-xs">
        {animationBars.map((height, i) => (
          <div
            key={i}
            className={cn(
              "flex-1 rounded-full transition-all duration-75",
              isRecording ? "bg-primary-600" : "bg-gray-200"
            )}
            style={{
              height: `${height * 100}%`,
              animationDelay: `${i * 40}ms`,
            }}
          />
        ))}
      </div>

      {/* Transcript display */}
      <div className="min-h-[48px] text-center">
        {state === "idle" && (
          <p className="text-muted-foreground text-sm">Tap to log an expense by voice</p>
        )}
        {isRecording && (
          <p className="text-primary-700 font-medium text-sm animate-pulse">Listening...</p>
        )}
        {isProcessing && (
          <p className="text-muted-foreground text-sm">Transcribing...</p>
        )}
        {state === "success" && transcript && (
          <p className="text-foreground font-medium text-sm italic">&quot;{transcript}&quot;</p>
        )}
        {state === "error" && (
          <p className="text-destructive text-sm">Something went wrong. Try again.</p>
        )}
      </div>

      {/* Mic button */}
      <div className="relative">
        {isRecording && (
          <>
            <span className="absolute inset-0 rounded-full bg-primary-600/30 animate-ping" />
            <span className="absolute inset-0 scale-110 rounded-full bg-primary-600/20 animate-pulse" />
          </>
        )}
        <button
          ref={buttonRef}
          onPointerDown={(e) => {
            if (e.pointerType === "mouse" && e.button !== 0) return;
            startRecording();
          }}
          onPointerUp={stopRecording}
          onPointerCancel={stopRecording}
          disabled={isProcessing}
          className={cn(
            "relative w-24 h-24 rounded-full flex items-center justify-center select-none",
            "shadow-fab transition-all duration-200 active:scale-95",
            isRecording ? "bg-red-500 scale-110" : "bg-primary-600",
            isProcessing && "bg-muted"
          )}
          aria-label={isRecording ? "Release to stop" : "Hold to record"}
        >
          {isProcessing ? (
            <svg className="w-8 h-8 animate-spin text-primary-600" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <svg
              className="w-8 h-8 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        {isRecording ? "Release to stop" : isProcessing ? "Processing..." : "Hold to speak"}
      </p>

      {(state === "success" || state === "error") && (
        <button
          onClick={reset}
          className="text-sm text-primary-600 font-medium hover:underline"
        >
          Record again
        </button>
      )}
    </div>
  );
}
