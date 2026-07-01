"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  QUESTIONNAIRE,
  visibleQuestions,
  totalSteps,
  type Answers,
  type Question,
} from "@/lib/questionnaire";
import { finishQuestionnaire } from "@/lib/actions/questionnaire";
import type { Role } from "@/lib/roles";

type SaveState = "idle" | "saving" | "saved" | "error";

export function QuestionnaireWizard({
  assessmentId,
  role,
  initialAnswers,
  initialStep,
}: {
  assessmentId: string;
  role: Role;
  initialAnswers: Answers;
  initialStep: number;
}) {
  const supabase = createClient();
  const [answers, setAnswers] = useState<Answers>(initialAnswers ?? {});
  const [stepIndex, setStepIndex] = useState(
    Math.min(Math.max(initialStep ?? 0, 0), totalSteps() - 1)
  );
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [finishing, setFinishing] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  const total = totalSteps();
  const step = QUESTIONNAIRE[stepIndex];
  const questions = visibleQuestions(step, role, answers);

  const persist = useCallback(
    async (nextAnswers: Answers, nextStep: number) => {
      setSaveState("saving");
      const { error } = await supabase
        .from("questionnaire_responses")
        .update({ answers: nextAnswers, current_step: nextStep })
        .eq("assessment_id", assessmentId);
      setSaveState(error ? "error" : "saved");
    },
    [supabase, assessmentId]
  );

  // Debounced autosave whenever answers change.
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void persist(answers, stepIndex);
    }, 800);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers]);

  function setValue(id: string, value: string | string[] | boolean) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function toggleMulti(id: string, option: string) {
    setAnswers((prev) => {
      const current = Array.isArray(prev[id]) ? (prev[id] as string[]) : [];
      const next = current.includes(option)
        ? current.filter((v) => v !== option)
        : [...current, option];
      return { ...prev, [id]: next };
    });
  }

  async function goTo(next: number) {
    const bounded = Math.min(Math.max(next, 0), total - 1);
    await persist(answers, bounded);
    setStepIndex(bounded);
    // Move focus to the new step heading for screen-reader users.
    setTimeout(() => headingRef.current?.focus(), 0);
  }

  async function onFinish() {
    setFinishing(true);
    await persist(answers, stepIndex);
    await finishQuestionnaire(assessmentId);
  }

  const pct = Math.round(((stepIndex + 1) / total) * 100);
  const isLast = stepIndex === total - 1;

  return (
    <div className="stack">
      <div>
        <p style={{ margin: "0 0 6px", fontWeight: 700 }}>
          Step {stepIndex + 1} of {total}
        </p>
        <div
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Questionnaire progress: ${pct}% complete`}
          style={{
            height: 10,
            background: "var(--ba-tint-1)",
            borderRadius: 6,
            overflow: "hidden",
            border: "1px solid var(--ba-border)",
          }}
        >
          <div
            style={{
              width: `${pct}%`,
              height: "100%",
              background: "var(--ba-mid-blue)",
            }}
          />
        </div>
      </div>

      <p aria-live="polite" role="status" className="muted" style={{ minHeight: 22 }}>
        {saveState === "saving"
          ? "Saving…"
          : saveState === "saved"
            ? "All changes saved"
            : saveState === "error"
              ? "We could not save just now — we will try again as you type."
              : ""}
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (isLast) void onFinish();
          else void goTo(stepIndex + 1);
        }}
      >
        <div
          className="card"
          role="group"
          aria-labelledby="step-heading"
          style={{ border: "1px solid var(--ba-border)" }}
        >
          <h2
            id="step-heading"
            tabIndex={-1}
            ref={headingRef}
            style={{ outline: "none", fontSize: "1.25rem", marginTop: 0 }}
          >
            {step.title}
          </h2>
          {step.intro ? <p className="muted">{step.intro}</p> : null}

          <div className="stack">
            {questions.map((q) => (
              <QuestionField
                key={q.id}
                q={q}
                value={answers[q.id]}
                onText={(v) => setValue(q.id, v)}
                onBool={(v) => setValue(q.id, v)}
                onToggleMulti={(opt) => toggleMulti(q.id, opt)}
              />
            ))}
          </div>
        </div>

        <div className="cluster between" style={{ marginTop: 20 }}>
          {stepIndex === 0 ? (
            <Link
              href={`/assessments/${assessmentId}`}
              className="btn btn-secondary"
            >
              ← Back to assessment
            </Link>
          ) : (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => void goTo(stepIndex - 1)}
            >
              ← Back
            </button>
          )}
          <button type="submit" className="btn btn-primary" disabled={finishing}>
            {isLast ? (finishing ? "Saving…" : "Finish and save") : "Next →"}
          </button>
        </div>
      </form>
    </div>
  );
}

function QuestionField({
  q,
  value,
  onText,
  onBool,
  onToggleMulti,
}: {
  q: Question;
  value: string | string[] | boolean | undefined;
  onText: (v: string) => void;
  onBool: (v: boolean) => void;
  onToggleMulti: (option: string) => void;
}) {
  const describedBy = q.help ? `${q.id}-help` : undefined;

  if (q.type === "yesno") {
    return (
      <fieldset style={{ border: 0, padding: 0, margin: 0 }} aria-describedby={describedBy}>
        <legend style={{ fontWeight: 700, color: "var(--ba-deep-blue)", marginBottom: 4 }}>
          {q.label}
        </legend>
        {q.help ? (
          <p className="hint" id={describedBy}>
            {q.help}
          </p>
        ) : null}
        <div className="cluster">
          {[
            { v: true, l: "Yes" },
            { v: false, l: "No" },
          ].map((opt) => (
            <label key={opt.l} className="check-option">
              <input
                type="radio"
                name={q.id}
                checked={value === opt.v}
                onChange={() => onBool(opt.v)}
              />
              <span>{opt.l}</span>
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  if (q.type === "multiselect") {
    const arr = Array.isArray(value) ? value : [];
    return (
      <fieldset style={{ border: 0, padding: 0, margin: 0 }} aria-describedby={describedBy}>
        <legend style={{ fontWeight: 700, color: "var(--ba-deep-blue)", marginBottom: 4 }}>
          {q.label}
        </legend>
        {q.help ? (
          <p className="hint" id={describedBy}>
            {q.help}
          </p>
        ) : null}
        <div className="grid grid-2" style={{ gap: 8 }}>
          {q.options?.map((opt) => (
            <label key={opt.value} className="check-option">
              <input
                type="checkbox"
                checked={arr.includes(opt.value)}
                onChange={() => onToggleMulti(opt.value)}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  return (
    <div className="field">
      <label htmlFor={q.id}>{q.label}</label>
      {q.help ? (
        <p className="hint" id={describedBy}>
          {q.help}
        </p>
      ) : null}
      {q.type === "textarea" ? (
        <textarea
          id={q.id}
          rows={3}
          aria-describedby={describedBy}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onText(e.target.value)}
        />
      ) : q.type === "select" ? (
        <select
          id={q.id}
          aria-describedby={describedBy}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onText(e.target.value)}
        >
          <option value="">Choose…</option>
          {q.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={q.id}
          type="text"
          aria-describedby={describedBy}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onText(e.target.value)}
        />
      )}
    </div>
  );
}
