"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { GUIDE_LANGUAGES, getGuideLanguage, type GuideLanguage } from "@/lib/guide/languages";
import styles from "./BiasLensGuide.module.css";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  language: GuideLanguage;
};

type BiasLensGuideProps = {
  embedded?: boolean;
};

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function preferredAudioType() {
  if (typeof MediaRecorder === "undefined") return "";
  const candidates = [
    "audio/ogg;codecs=opus",
    "audio/ogg",
    "audio/webm;codecs=opus",
    "audio/webm",
  ];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || "";
}

function displayText(content: string) {
  return content
    .replace(/\*\*/g, "")
    .replace(/^\s*\*\s+/gm, "• ")
    .replace(/^\s*-\s+/gm, "• ")
    .trim();
}

function speechText(content: string) {
  return displayText(content)
    .replace(/^\s*•\s+/gm, "")
    .trim();
}

export function BiasLensGuide({ embedded = false }: BiasLensGuideProps) {
  const [language, setLanguage] = useState<GuideLanguage>("en");
  const languageConfig = useMemo(() => getGuideLanguage(language), [language]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello. Ask me anything about BiasLens, algorithmic bias, accessibility, evidence, or assessing an AI system.",
      language: "en",
    },
  ]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function changeLanguage(nextLanguage: GuideLanguage) {
    setLanguage(nextLanguage);
    setStatus(`Language changed to ${getGuideLanguage(nextLanguage).label}.`);
    setError("");
  }

  async function sendMessage(text: string) {
    const content = text.trim();
    if (!content || busy) return;

    const userMessage: ChatMessage = {
      id: makeId("user"),
      role: "user",
      content,
      language,
    };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setDraft("");
    setBusy(true);
    setError("");
    setStatus("BiasLens Guide is answering.");

    try {
      const response = await fetch("/api/guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          messages: nextMessages.slice(-10).map(({ role, content: messageContent }) => ({
            role,
            content: messageContent,
          })),
        }),
      });

      const payload = (await response.json()) as { text?: string; error?: string };
      if (!response.ok || !payload.text) {
        throw new Error(payload.error || "BiasLens Guide could not answer just now.");
      }

      setMessages((current) => [
        ...current,
        {
          id: makeId("assistant"),
          role: "assistant",
          content: payload.text as string,
          language,
        },
      ]);
      setStatus("Answer ready. Listen controls are directly below the answer.");
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "BiasLens Guide could not answer just now.";
      setError(message);
      setStatus("");
    } finally {
      setBusy(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(draft);
  }

  function stopMediaStream() {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }
  }

  async function transcribeRecording(blob: Blob) {
    setIsTranscribing(true);
    setStatus("Turning your voice into text…");
    setError("");

    try {
      const formData = new FormData();
      const extension = blob.type.includes("ogg") ? "ogg" : "webm";
      formData.append("audio", new File([blob], `biaslens-question.${extension}`, { type: blob.type || "audio/ogg" }));
      formData.append("language", languageConfig.locale);

      const response = await fetch("/api/guide/transcribe", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as { text?: string; error?: string };

      if (!response.ok || !payload.text) {
        throw new Error(payload.error || "Voice input could not be transcribed.");
      }

      setDraft(payload.text);
      setStatus("Voice question added to the question box. Review it, then press Send.");
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Voice input could not be transcribed.";
      setError(message);
      setStatus("");
    } finally {
      setIsTranscribing(false);
    }
  }

  async function startRecording() {
    setError("");

    if (
      typeof window === "undefined" ||
      typeof MediaRecorder === "undefined" ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setError("Voice input is not supported by this browser. You can still type your question.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      audioChunksRef.current = [];

      const mimeType = preferredAudioType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      recorder.onerror = () => {
        setError("The microphone recording failed. Please try again or type your question.");
        setIsRecording(false);
        stopMediaStream();
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || mimeType || "audio/ogg",
        });
        setIsRecording(false);
        stopMediaStream();
        if (audioBlob.size > 0) void transcribeRecording(audioBlob);
      };

      recorder.start();
      setIsRecording(true);
      setStatus("Listening… Speak your question, then press Stop recording.");
      recordingTimeoutRef.current = setTimeout(() => {
        if (recorder.state === "recording") recorder.stop();
      }, 45_000);
    } catch {
      setIsRecording(false);
      stopMediaStream();
      setError("Microphone access was not available. You can type your question instead.");
    }
  }

  function stopRecording() {
    const recorder = mediaRecorderRef.current;
    if (recorder?.state === "recording") {
      recorder.stop();
      setStatus("Recording stopped. Turning your voice into text…");
    }
  }

  function listenToAnswer(message: ChatMessage) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setError("Read-aloud is not available in this browser. The answer remains available as text.");
      return;
    }

    setError("");
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(speechText(message.content));
    const config = getGuideLanguage(message.language);
    utterance.lang = config.locale;
    const prefix = config.locale.split("-")[0].toLowerCase();
    const voice = window.speechSynthesis
      .getVoices()
      .find((candidate) => candidate.lang.toLowerCase().startsWith(prefix));
    if (voice) utterance.voice = voice;
    utterance.onstart = () => setStatus("Reading this answer aloud.");
    utterance.onend = () => setStatus("Read-aloud finished.");
    utterance.onerror = () => setError("Read-aloud could not start. The answer remains available as text.");
    window.speechSynthesis.speak(utterance);
  }

  function stopListening() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setStatus("Read-aloud stopped.");
    }
  }

  return (
    <section
      className={`${styles.guide} ${embedded ? styles.embedded : ""}`}
      aria-labelledby={embedded ? undefined : "biaslens-guide-title"}
      aria-label={embedded ? "BiasLens Guide" : undefined}
    >
      <div className={styles.header}>
        {!embedded && (
          <div>
            <h1 id="biaslens-guide-title">BiasLens Guide</h1>
            <p className={styles.privacy}>Please do not share sensitive person-level information.</p>
          </div>
        )}
        <div className={styles.languageControl}>
          <label htmlFor="guide-language">Language</label>
          <select
            id="guide-language"
            value={language}
            onChange={(event) => changeLanguage(event.target.value as GuideLanguage)}
          >
            {GUIDE_LANGUAGES.map((item) => (
              <option value={item.code} key={item.code} lang={item.locale}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.messages} aria-label="BiasLens Guide conversation" aria-live="off">
        {messages.map((message) => (
          <article
            key={message.id}
            className={`${styles.message} ${message.role === "user" ? styles.userMessage : styles.assistantMessage}`}
            lang={getGuideLanguage(message.language).locale}
          >
            <strong>{message.role === "user" ? "You" : "BiasLens Guide"}</strong>
            <div>{message.role === "assistant" ? displayText(message.content) : message.content}</div>
            {message.role === "assistant" && message.id !== "welcome" && (
              <div className={styles.answerControls}>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => listenToAnswer(message)}
                  aria-label="Listen to this BiasLens Guide answer"
                >
                  Listen to this answer
                </button>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={stopListening}
                  aria-label="Stop listening to the BiasLens Guide answer"
                >
                  Stop listening
                </button>
              </div>
            )}
          </article>
        ))}
        {busy && <p className={styles.thinking}>BiasLens Guide is typing…</p>}
      </div>

      <form className={styles.composer} onSubmit={submit}>
        <label htmlFor="guide-message">Your question</label>
        <textarea
          id="guide-message"
          value={draft}
          maxLength={4000}
          lang={languageConfig.locale}
          placeholder={languageConfig.placeholder}
          onChange={(event) => setDraft(event.target.value)}
        />

        <div className={styles.controls}>
          <button type="submit" className={styles.button} disabled={!draft.trim() || busy || isTranscribing}>
            {busy ? "Sending…" : languageConfig.send}
          </button>
          {!isRecording ? (
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => void startRecording()}
              disabled={busy || isTranscribing}
            >
              {isTranscribing ? "Transcribing…" : languageConfig.speak || "Speak"}
            </button>
          ) : (
            <button type="button" className={styles.secondaryButton} onClick={stopRecording}>
              Stop recording
            </button>
          )}
        </div>

        {status && (
          <p className={styles.status} role="status" aria-live="polite" aria-atomic="true">
            {status}
          </p>
        )}
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
      </form>
    </section>
  );
}
