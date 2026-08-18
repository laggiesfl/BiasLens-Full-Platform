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

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function BiasLensGuide() {
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
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const latestAssistantMessage = [...messages].reverse().find((message) => message.role === "assistant");

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
      setStatus("Answer ready.");
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

  function startRecognition() {
    setError("");

    if (typeof window === "undefined") return;
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      setError("Voice input is not available in this browser. You can type your question instead.");
      return;
    }

    try {
      const recognition = new Recognition();
      recognition.lang = languageConfig.locale;
      recognition.interimResults = false;
      recognition.continuous = false;
      recognition.onresult = (event) => {
        const transcript = event.results[0]?.[0]?.transcript?.trim() || "";
        if (transcript) {
          setDraft(transcript);
          setStatus("Voice input added to the question box. Review it, then press Send.");
        }
      };
      recognition.onerror = () => {
        setError("I could not understand that clearly. Try speaking again or type your question.");
      };
      recognition.onend = () => setIsRecording(false);
      recognitionRef.current = recognition;
      setIsRecording(true);
      setStatus("Listening…");
      recognition.start();
    } catch {
      setIsRecording(false);
      setError("Voice input could not start. You can type your question instead.");
    }
  }

  function stopRecognition() {
    recognitionRef.current?.stop();
    setIsRecording(false);
    setStatus("Voice input stopped.");
  }

  function listenToLatestAnswer() {
    if (!latestAssistantMessage) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setError("Read-aloud is not available in this browser. The answer remains available as text.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(latestAssistantMessage.content);
    const config = getGuideLanguage(latestAssistantMessage.language);
    utterance.lang = config.locale;
    const prefix = config.locale.split("-")[0].toLowerCase();
    const voice = window.speechSynthesis
      .getVoices()
      .find((candidate) => candidate.lang.toLowerCase().startsWith(prefix));
    if (voice) utterance.voice = voice;
    utterance.onstart = () => setStatus("Reading the latest answer aloud.");
    utterance.onend = () => setStatus("Read-aloud finished.");
    window.speechSynthesis.speak(utterance);
  }

  return (
    <section className={styles.guide} aria-labelledby="biaslens-guide-title">
      <div className={styles.header}>
        <div>
          <h1 id="biaslens-guide-title">BiasLens Guide</h1>
          <p className={styles.privacy}>Please do not share sensitive person-level information.</p>
        </div>
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
            <div>{message.content}</div>
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
          <button type="submit" className={styles.button} disabled={!draft.trim() || busy}>
            {busy ? "Sending…" : languageConfig.send}
          </button>
          {!isRecording ? (
            <button type="button" className={styles.secondaryButton} onClick={startRecognition}>
              {languageConfig.speak || "Speak"}
            </button>
          ) : (
            <button type="button" className={styles.secondaryButton} onClick={stopRecognition}>
              Stop recording
            </button>
          )}
          <button type="button" className={styles.secondaryButton} onClick={listenToLatestAnswer}>
            Listen to latest answer
          </button>
        </div>

        <p className={styles.status} role="status" aria-live="polite" aria-atomic="true">
          {status}
        </p>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
      </form>
    </section>
  );
}
