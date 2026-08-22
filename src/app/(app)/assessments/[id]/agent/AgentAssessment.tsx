"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { Answers } from "@/lib/questionnaire";
import type { AgentQuestion } from "@/lib/agent/types";
import type { AgentTurnResult } from "@/lib/agent/orchestrator";
import type { AssessmentAnswer, EvidenceState } from "@/lib/agent/core-service";
import type { AssessmentAgentSummary } from "@/lib/agent/summary";
import { AgentSummary } from "./AgentSummary";

const EVIDENCE_STATE_LABELS: Record<EvidenceState, string> = {
  established: "Established",
  derived: "Derived",
  inferred: "Inferred",
  unknown: "Unknown",
  conflicted: "Conflicted",
};

function blankAnswer(question: AgentQuestion): AssessmentAnswer {
  if (question.type === "multiselect") return [];
  return "";
}

function answerAsText(value: AssessmentAnswer) {
  if (Array.isArray(value)) return value.length ? value.join(", ") : "No answer";
  if (value === "unsure") return "Not sure";
  if (value === "true" || value === true) return "Yes";
  if (value === "false" || value === false) return "No";
  return String(value || "No answer");
}

function QuestionControl({
  question,
  value,
  onChange,
  disabled,
}: {
  question: AgentQuestion;
  value: AssessmentAnswer;
  onChange: (value: AssessmentAnswer) => void;
  disabled: boolean;
}) {
  const inputId = `agent-answer-${question.id}`;
  const hintId = question.help ? `${inputId}-hint` : undefined;

  if (question.type === "textarea") {
    return (
      <div className="field">
        <label htmlFor={inputId}>{question.label}</label>
        {question.help ? (
          <p className="hint" id={hintId}>
            {question.help}
          </p>
        ) : null}
        <textarea
          id={inputId}
          rows={5}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
          aria-describedby={hintId}
          required={question.required}
          disabled={disabled}
        />
      </div>
    );
  }

  if (question.type === "select") {
    return (
      <div className="field">
        <label htmlFor={inputId}>{question.label}</label>
        {question.help ? (
          <p className="hint" id={hintId}>
            {question.help}
          </p>
        ) : null}
        <select
          id={inputId}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
          aria-describedby={hintId}
          required={question.required}
          disabled={disabled}
        >
          <option value="">Choose an option…</option>
          {(question.options ?? []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (question.type === "multiselect") {
    const selected = Array.isArray(value) ? value : [];
    return (
      <fieldset className="agent-choice-group" disabled={disabled}>
        <legend>{question.label}</legend>
        {question.help ? <p className="hint">{question.help}</p> : null}
        <div className="stack agent-choice-list">
          {(question.options ?? []).map((option) => {
            const optionId = `${inputId}-${option.value.replace(/[^a-z0-9]+/gi, "-")}`;
            const checked = selected.includes(option.value);
            return (
              <label
                key={option.value}
                htmlFor={optionId}
                className="check-option agent-choice"
                style={{ minHeight: 48, padding: "8px 4px", cursor: "pointer" }}
              >
                <input
                  id={optionId}
                  type="checkbox"
                  checked={checked}
                  onChange={(event) =>
                    onChange(
                      event.target.checked
                        ? [...selected, option.value]
                        : selected.filter((item) => item !== option.value)
                    )
                  }
                />
                <span>{option.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>
    );
  }

  if (question.type === "yesno" || question.type === "yesnounsure") {
    const options = [
      { value: "true", label: "Yes" },
      { value: "false", label: "No" },
      ...(question.type === "yesnounsure"
        ? [{ value: "unsure", label: "Not sure" }]
        : []),
    ];
    return (
      <fieldset className="agent-choice-group" disabled={disabled}>
        <legend>{question.label}</legend>
        {question.help ? <p className="hint">{question.help}</p> : null}
        <div className="stack agent-choice-list">
          {options.map((option) => {
            const optionId = `${inputId}-${option.value}`;
            return (
              <label
                key={option.value}
                htmlFor={optionId}
                className="check-option agent-choice"
                style={{ minHeight: 48, padding: "8px 4px", cursor: "pointer" }}
              >
                <input
                  id={optionId}
                  name={inputId}
                  type="radio"
                  value={option.value}
                  checked={value === option.value}
                  onChange={() => onChange(option.value)}
                  required={question.required}
                />
                <span>{option.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>
    );
  }

  return (
    <div className="field">
      <label htmlFor={inputId}>{question.label}</label>
      {question.help ? (
        <p className="hint" id={hintId}>
          {question.help}
        </p>
      ) : null}
      <input
        id={inputId}
        type="text"
        value={typeof value === "string" ? value : ""}
        onChange={(event) => onChange(event.target.value)}
        aria-describedby={hintId}
        required={question.required}
        disabled={disabled}
      />
    </div>
  );
}

export function AgentAssessment({
  assessmentId,
  assessmentTitle,
  initialTurn,
  initialAnswers,
  initialEvidenceStates,
  initialSummary = null,
}: {
  assessmentId: string;
  assessmentTitle: string;
  initialTurn: AgentTurnResult;
  initialAnswers: Answers;
  initialEvidenceStates: EvidenceState[];
  initialSummary?: AssessmentAgentSummary | null;
}) {
  const [turn, setTurn] = useState<AgentTurnResult>(initialTurn);
  const [summary, setSummary] = useState<AssessmentAgentSummary | null>(initialSummary);
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [answer, setAnswer] = useState<AssessmentAnswer>(
    initialTurn.type === "question" ? blankAnswer(initialTurn.question) : ""
  );
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const questionHeadingRef = useRef<HTMLHeadingElement>(null);

  const currentQuestion = turn.type === "question" ? turn.question : null;
  const evidenceStates = useMemo(
    () => Array.from(new Set(initialEvidenceStates)),
    [initialEvidenceStates]
  );

  useEffect(() => {
    if (!currentQuestion) return;
    setAnswer(blankAnswer(currentQuestion));
    window.requestAnimationFrame(() => {
      questionHeadingRef.current?.focus();
    });
  }, [currentQuestion?.id]);

  async function submitAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!currentQuestion || sending) return;

    setSending(true);
    setError("");
    setStatus("Saving your answer…");

    try {
      const response = await fetch(`/api/assessments/${assessmentId}/agent`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          answer,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "BiasLens could not save this answer.");
      }

      setAnswers((current) => ({ ...current, [currentQuestion.id]: answer }));
      setTurn(data as AgentTurnResult);
      setSummary(data.summary ?? null);
      setStatus(
        data.type === "question"
          ? "Answer saved. The next question is ready."
          : data.type === "human_review_required"
            ? "Answer saved. Human review is recommended."
            : "Answer saved. The guided questions are complete."
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "BiasLens could not save this answer.");
      setStatus("");
    } finally {
      setSending(false);
    }
  }

  const cannotSubmit =
    currentQuestion?.required &&
    (Array.isArray(answer) ? answer.length === 0 : String(answer).trim() === "");

  return (
    <div className="stack agent-assessment-layout">
      <div className="page-header">
        <p className="eyebrow">BiasLens Assess</p>
        <h1>{assessmentTitle}</h1>
        <p>
          Work through one question at a time. BiasLens keeps missing, uncertain and
          conflicting evidence visible instead of asking you to guess.
        </p>
      </div>

      <div className="agent-toolbar cluster">
        <Link href={`/assessments/${assessmentId}`} className="btn btn-secondary">
          Save and leave
        </Link>
        <Link href={`/assessments/${assessmentId}/evidence`} className="btn btn-secondary">
          Open Evidence Log
        </Link>
      </div>

      {status ? (
        <p className="form-success" role="status" aria-live="polite">
          {status}
        </p>
      ) : null}
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}

      <section className="card agent-evidence-posture" aria-labelledby="evidence-posture-heading">
        <h2 id="evidence-posture-heading">Evidence posture</h2>
        {evidenceStates.length ? (
          <ul>
            {evidenceStates.map((state) => (
              <li key={state}>
                <strong>{EVIDENCE_STATE_LABELS[state]}</strong>
              </li>
            ))}
          </ul>
        ) : (
          <p>No Evidence State has been recorded yet.</p>
        )}
        <p className="hint">
          BiasLens uses visible text states: Established, Derived, Inferred, Unknown and
          Conflicted. Unknown means evidence is not yet available or established;
          Conflicted means material sources do not agree.
        </p>
      </section>

      {turn.type === "question" ? (
        <section className="card agent-question-card" aria-labelledby="agent-question-heading">
          <p className="agent-step-name">{turn.question.stepTitle}</p>
          <h2 id="agent-question-heading" ref={questionHeadingRef} tabIndex={-1}>
            Current question
          </h2>
          <form onSubmit={submitAnswer} className="stack">
            <QuestionControl
              question={turn.question}
              value={answer}
              onChange={setAnswer}
              disabled={sending}
            />
            <div className="cluster">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={sending || Boolean(cannotSubmit)}
              >
                {sending ? "Saving…" : "Save answer and continue"}
              </button>
            </div>
          </form>
        </section>
      ) : turn.type === "human_review_required" ? (
        <section className="card" aria-labelledby="review-heading">
          <h2 id="review-heading">Human review recommended</h2>
          <p>{turn.message}</p>
          <p>
            <strong>Reason:</strong> {turn.reason}
          </p>
          <p className="hint">
            This is an escalation for judgement, not a finding that the system is biased,
            unlawful or non-compliant.
          </p>
        </section>
      ) : (
        <section className="card" aria-labelledby="complete-heading">
          <h2 id="complete-heading">Guided questions complete</h2>
          <p>{turn.message}</p>
        </section>
      )}

      {summary ? <AgentSummary summary={summary} /> : null}

      <details className="card agent-review-answers">
        <summary>Review answers already recorded</summary>
        {Object.keys(answers).length ? (
          <dl>
            {Object.entries(answers).map(([questionId, value]) => (
              <div key={questionId} className="agent-review-row">
                <dt>{questionId.replaceAll("_", " ")}</dt>
                <dd>{answerAsText(value as AssessmentAnswer)}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p>No answers have been recorded yet.</p>
        )}
      </details>
    </div>
  );
}
