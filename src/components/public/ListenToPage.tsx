"use client";

import { useEffect, useRef, useState } from "react";

export function ListenToPage() {
  const [speaking, setSpeaking] = useState(false);
  const [status, setStatus] = useState("");
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function stop() {
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setStatus("Reading stopped.");
  }

  function toggle() {
    if (!("speechSynthesis" in window)) {
      setStatus("Your browser does not support the read-aloud feature.");
      return;
    }

    if (speaking) {
      stop();
      return;
    }

    const target = document.querySelector<HTMLElement>("[data-listen-content]");
    const text = target?.innerText.replace(/\s+/g, " ").trim();
    if (!text) {
      setStatus("There is no page text available to read.");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = document.documentElement.lang || "en";
    utterance.rate = 1;
    utterance.onstart = () => {
      setSpeaking(true);
      setStatus("Reading started.");
    };
    utterance.onend = () => {
      setSpeaking(false);
      setStatus("Finished reading the page.");
    };
    utterance.onerror = () => {
      setSpeaking(false);
      setStatus("The read-aloud feature could not complete.");
    };
    utteranceRef.current = utterance;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  return (
    <div className="public-listen-wrap">
      <button type="button" className="public-link-button" onClick={toggle}>
        {speaking ? "Stop listening" : "Listen to this page"}
      </button>
      <span className="sr-only" aria-live="polite">{status}</span>
    </div>
  );
}
