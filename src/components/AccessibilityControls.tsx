"use client";

import { useEffect, useState } from "react";

const TEXT_KEY = "biaslens-text-size";
const CONTRAST_KEY = "biaslens-high-contrast";
const MOTION_KEY = "biaslens-reduce-motion";

function initialTextSize() {
  if (typeof window === "undefined") return 100;
  const saved = Number(window.localStorage.getItem(TEXT_KEY));
  return Number.isFinite(saved) ? Math.min(Math.max(saved, 80), 200) : 100;
}

function initialFlag(key: string) {
  return typeof window !== "undefined" && window.localStorage.getItem(key) === "true";
}

export function AccessibilityControls() {
  const [textSize, setTextSize] = useState(initialTextSize);
  const [highContrast, setHighContrast] = useState(() => initialFlag(CONTRAST_KEY));
  const [reduceMotion, setReduceMotion] = useState(() => initialFlag(MOTION_KEY));
  const [status, setStatus] = useState("");

  useEffect(() => {
    const root = document.documentElement;
    root.style.fontSize = `${textSize}%`;
    root.classList.toggle("biaslens-high-contrast", highContrast);
    root.classList.toggle("biaslens-reduce-motion", reduceMotion);
    window.localStorage.setItem(TEXT_KEY, String(textSize));
    window.localStorage.setItem(CONTRAST_KEY, String(highContrast));
    window.localStorage.setItem(MOTION_KEY, String(reduceMotion));
  }, [textSize, highContrast, reduceMotion]);

  function changeTextSize(next: number) {
    setTextSize(next);
    setStatus(`Text size set to ${next} percent.`);
  }

  function resetAll() {
    setTextSize(100);
    setHighContrast(false);
    setReduceMotion(false);
    setStatus("Accessibility settings reset.");
  }

  return (
    <section className="biaslens-accessibility-bar" aria-label="Accessibility controls">
      <div className="biaslens-accessibility-inner">
        <strong>Accessibility</strong>
        <button type="button" onClick={() => changeTextSize(Math.max(textSize - 10, 80))} aria-label="Decrease text size">
          A- Decrease
        </button>
        <button type="button" onClick={() => changeTextSize(100)} aria-label="Reset text size">
          A Reset
        </button>
        <button type="button" onClick={() => changeTextSize(Math.min(textSize + 10, 200))} aria-label="Increase text size">
          A+ Increase
        </button>
        <button type="button" aria-pressed={highContrast} onClick={() => { setHighContrast((value) => !value); setStatus(`High contrast ${highContrast ? "disabled" : "enabled"}.`); }}>
          High contrast
        </button>
        <button type="button" aria-pressed={reduceMotion} onClick={() => { setReduceMotion((value) => !value); setStatus(`Reduce motion ${reduceMotion ? "disabled" : "enabled"}.`); }}>
          Reduce motion
        </button>
        <button type="button" onClick={resetAll}>Reset accessibility</button>
        <span className="sr-only" aria-live="polite">{status}</span>
      </div>
    </section>
  );
}
