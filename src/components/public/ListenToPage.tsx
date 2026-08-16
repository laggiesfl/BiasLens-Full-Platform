"use client";

import { useEffect, useRef, useState } from "react";

type ListenState = "idle" | "speaking" | "paused";

export function ListenToPage({ targetId }: { targetId: string }) {
  const [listenState, setListenState] = useState<ListenState>("idle");
  const [status, setStatus] = useState("");
  const stoppingRef = useRef(false);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        stoppingRef.current = true;
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function stop() {
    if (!("speechSynthesis" in window)) return;
    stoppingRef.current = true;
    window.speechSynthesis.cancel();
    setListenState("idle");
    setStatus("Reading stopped.");
  }

  function pause() {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.pause();
    setListenState("paused");
    setStatus("Reading paused. Choose Resume listening to continue from this point.");
  }

  function resume() {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.resume();
    setListenState("speaking");
    setStatus("Reading resumed from the paused position.");
  }

  function start() {
    if (!("speechSynthesis" in window)) {
      setStatus("Read-aloud is not available in this browser.");
      return;
    }

    const target = document.getElementById(targetId);
    const text = target?.innerText.replace(/\s+/g, " ").trim();
    if (!text) {
      setStatus("There is no page text available to read.");
      return;
    }

    stoppingRef.current = false;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = document.documentElement.lang || "en";
    utterance.rate = 1;
    utterance.onstart = () => {
      setListenState("speaking");
      setStatus("Reading started.");
    };
    utterance.onend = () => {
      if (stoppingRef.current) return;
      setListenState("idle");
      setStatus("Finished reading the page.");
    };
    utterance.onerror = (event) => {
      if (stoppingRef.current || event.error === "canceled" || event.error === "interrupted") return;
      setListenState("idle");
      setStatus("The read-aloud feature could not complete.");
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  function togglePauseResume() {
    if (listenState === "paused") {
      resume();
      return;
    }
    if (listenState === "speaking") {
      pause();
      return;
    }
    start();
  }

  const primaryLabel = listenState === "speaking"
    ? "Pause listening"
    : listenState === "paused"
      ? "Resume listening"
      : "Listen to this page";

  return (
    <div className="public-listen-wrap">
      <button
        type="button"
        className="public-link-button"
        onClick={togglePauseResume}
        aria-pressed={listenState === "paused"}
      >
        {primaryLabel}
      </button>
      {listenState !== "idle" && (
        <button type="button" className="public-link-button public-listen-stop" onClick={stop}>
          Stop listening
        </button>
      )}
      <span className="sr-only" aria-live="polite">{status}</span>
    </div>
  );
}
