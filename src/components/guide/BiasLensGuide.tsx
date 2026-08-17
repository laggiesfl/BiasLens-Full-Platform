"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import {
  GUIDE_LANGUAGES,
  STARTER_QUESTIONS,
  getGuideLanguage,
  type GuideLanguage,
} from "@/lib/guide/languages";
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
      content: getGuideLanguage("en").welcome,
      language: "en",
    },
  ]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptPending, setTranscriptPending] = useState(false);
  const [speechRate, setSpeechRate] = useState("1");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  function changeLanguage(nextLanguage: GuideLanguage) {
    setLanguage(nextLanguage);
    const next = getGuideLanguage(nextLanguage);
    if (messages.length === 1 && messages[0].id === "welcome") {
      setMessages([{ id: "welcome", role: "assistant", content: next.welcome, language: nextLanguage }]);
    }
    setStatus(`Language: ${next.label}`);
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
    setTranscriptPending(false);
    setBusy(true);
    setError("");
    setStatus("BiasLens Guide is preparing an answer.");

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
    setTranscriptPending(false);

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
          setTranscriptPending(true);
          setStatus("Voice transcription is ready. Please review it before sending.");
        }
      };
      recognition.onerror = () => {
        setError("I could not confidently understand that. You can try speaking again or type your question instead.");
      };
      recognition.onend = () => {
        setIsRecording(false);
      };
      recognitionRef.current = recognition;
      setIsRecording(true);
      setStatus("Listening. Speak your question, then review the transcript before sending.");
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

  function speak(text: string, messageLanguage: GuideLanguage) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setError("Read-aloud is not available in this browser. The full answer remains available as text.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const config = getGuideLanguage(messageLanguage);
    utterance.lang = config.locale;
    utterance.rate = Number(speechRate);
    const prefix = config.locale.split("-")[0].toLowerCase();
    const voice = window.speechSynthesis
      .getVoices()
      .find((candidate) => candidate.lang.toLowerCase().startsWith(prefix));
    if (voice) utterance.voice = voice;
    utterance.onstart = () => setStatus("Reading answer aloud.");
    utterance.onend = () => setStatus("Read-aloud finished.");
    window.speechSynthesis.speak(utterance);
  }

  function pauseOrResume() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setStatus("Read-aloud resumed.");
    } else if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setStatus("Read-aloud paused.");
    }
  }

  function stopSpeaking() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setStatus("Read-aloud stopped.");
  }

  return (
    <section className={styles.guide} aria-labelledby="biaslens-guide-title">
      <div className={styles.header}>
        <h1 id="biaslens-guide-title">BiasLens Guide</h1>
        <p>{languageConfig.welcome}</p>
        <p className={styles.privacy}>{languageConfig.privacyNote}</p>
        <div className={styles.languageRow}>
          <div>
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
          <div className={styles.rateControl}>
            <label htmlFor="speech-rate">Read-aloud speed</label>
            <select id="speech-rate" value={speechRate} onChange={(event) => setSpeechRate(event.target.value)}>
              <option value="0.75">0.75×</option>
              <option value="1">1×</option>
              <option value="1.25">1.25×</option>
              <option value="1.5">1.5×</option>
            </select>
          </div>
        </div>
      </div>

      <div className={styles.starters}>
        <h2>Start with a question</h2>
        <div className={styles.starterGrid}>
          {STARTER_QUESTIONS[language].map((question) => (
            <button
              key={question}
              type="button"
              className={styles.starterButton}
              disabled={busy}
              lang={languageConfig.locale}
              onClick={() => void sendMessage(question)}
            >
              {question}
            </button>
          ))}
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
            {message.role === "assistant" && (
              <div className={styles.messageActions}>
                <button type="button" className={styles.smallButton} onClick={() => speak(message.content, message.language)}>
                  {languageConfig.listen}
                </button>
                <button type="button" className={styles.smallButton} onClick={pauseOrResume}>
                  Pause / Resume
                </button>
                <button type="button" className={styles.smallButton} onClick={stopSpeaking}>
                  {languageConfig.stop}
                </button>
              </div>
            )}
          </article>
        ))}
      </div>

      <form className={styles.composer} onSubmit={submit}>
        <label htmlFor="guide-message">Your question</label>
        <textarea
          id="guide-message"
          value={draft}
          maxLength={4000}
          lang={languageConfig.locale}
          placeholder={languageConfig.placeholder}
          onChange={(event) => {
            setDraft(event.target.value);
            if (transcriptPending) setTranscriptPending(false);
          }}
        />

        {transcriptPending && (
          <div className={styles.transcriptBox}>
            <strong>I heard:</strong>
            <p lang={languageConfig.locale}>{draft}</p>
            <div className={styles.controls}>
              <button type="button" className={styles.button} disabled={!draft.trim() || busy} onClick={() => void sendMessage(draft)}>
                {languageConfig.send}
              </button>
              <button type="button" className={styles.secondaryButton} onClick={startRecognition}>
                Try again
              </button>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => {
                  setTranscriptPending(false);
                  setDraft("");
                  setStatus("Voice transcription cancelled.");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className={styles.controls}>
          <button type="submit" className={styles.button} disabled={!draft.trim() || busy || transcriptPending}>
            {busy ? "Sending…" : languageConfig.send}
          </button>
          {!isRecording ? (
            <button type="button" className={styles.secondaryButton} onClick={startRecognition}>
              {languageConfig.speak}
            </button>
          ) : (
            <button type="button" className={styles.secondaryButton} onClick={stopRecognition}>
              Stop recording
            </button>
          )}
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
