# Document 02 — BiasLens Division Build Roadmap & Agent Architecture

**Status:** Approved  
**Approved by:** Project owner  
**Date:** 22 August 2026  
**Project:** BiasLens Division — Agent Assessment Platform  
**First product:** BiasLens Assess — Agent-led AI System Assessment

## 1. Goal

Build a separate BiasLens Agent layer that conducts adaptive AI-system assessments while using the existing BiasLens platform as the authoritative system of record for assessments, evidence, provenance, Evidence State, permissions, findings and Algorithm Defence File outputs.

## 2. Chosen architecture

**Option C — separate BiasLens Agent project sharing the BiasLens core evidence platform.**

The agent is not merged into the public BiasLens Guide and does not replace the existing assessment data model. It operates as a controlled client of BiasLens Core.

```text
BIASLENS DIVISION
│
├── BiasLens Core
│   ├── Authentication and permissions
│   ├── Assessments
│   ├── Evidence and provenance
│   ├── Evidence States
│   ├── Findings and audit history
│   └── Algorithm Defence File
│
└── BiasLens Agent Layer
    ├── Assessment conversation
    ├── Adaptive questioning
    ├── Evidence interpretation
    ├── Bias-pathway analysis
    ├── Escalation rules
    └── Structured tool calls into BiasLens Core
```

## 3. Core design rule

**The agent does not own the evidence record. BiasLens Core does.**

The agent may read authorised assessment context, ask questions, interpret evidence, propose Evidence States, identify gaps and propose findings. Authoritative records must be persisted through validated BiasLens Core interfaces with user identity, provenance and audit history preserved.

## 4. Product boundary

### BiasLens Guide
Purpose: explain BiasLens, answer methodology questions and support public discovery.

### BiasLens Assessment Agent
Purpose: perform an authenticated BiasLens assessment with the user.

These remain separate experiences and must not become one combined chatbot.

## 5. Milestone 1 scope

A signed-in user can:

1. start an agent-led assessment;
2. identify the AI system and the decision or process it influences;
3. answer adaptive questions one at a time;
4. save and resume the assessment;
5. attach or reference supporting evidence;
6. see evidence state expressed in plain language;
7. explicitly record missing or conflicting evidence;
8. receive a structured interim/final assessment summary;
9. route matters requiring human judgement to an expert-review state.

## 6. Initial agent capabilities

The first release exposes six controlled capabilities:

1. `start_assessment`
2. `get_assessment_context`
3. `determine_next_question`
4. `record_assessment_response`
5. `record_evidence_posture`
6. `generate_assessment_summary`

These functions must be deterministic at the persistence boundary even when the model reasoning is probabilistic.

## 7. Agent decision boundary

The agent may:

- choose conversational wording;
- explain why a question matters;
- identify an evidence gap;
- propose one of the approved Evidence States;
- identify potential bias pathways supported by the record;
- recommend further evidence or human review.

The agent may not:

- invent assessment questions outside the approved BiasLens methodology;
- silently convert `Not sure` or missing information into a negative answer;
- declare an AI system `biased`, `unbiased`, `compliant`, or `non-compliant` as an automatic verdict;
- conclude unlawful discrimination without appropriate evidence and legal analysis;
- issue runtime `ALLOW` or `BLOCK` authority;
- overwrite or erase provenance/history to make an assessment appear cleaner.

## 8. Data and persistence

### Authoritative records
BiasLens Core remains authoritative for:

- `assessments`;
- `ai_system_profiles`;
- `questionnaire_responses`;
- evidence log entries and Evidence State;
- risk/findings records;
- activity/audit records;
- report/ADF outputs.

### Agent-only state
The agent may keep resumable conversation/session state separately, but that state is not evidence by itself. Material facts used in an assessment must be explicitly persisted into BiasLens Core through validated interfaces.

## 9. Adaptive questioning

The existing config-driven `QUESTIONNAIRE` remains the approved question source for Milestone 1. The deterministic methodology layer evaluates `visibleIf` rules using the current user role and saved answers, treats `unsure` as an answered epistemic state, and selects the first visible unanswered question in approved questionnaire order.

The language model may make the interaction more natural, but it does not decide which unapproved questions become part of the assessment record.

## 10. Evidence posture

Milestone 1 uses the formal Evidence State model:

- Established
- Derived
- Inferred
- Unknown
- Conflicted

Every Evidence State shown to a human must have a text label and plain-language explanation. Unknown and Conflicted states are legitimate governance findings and must remain as perceptible as Established evidence.

## 11. Human review

The agent can escalate when:

- material evidence conflicts;
- consequential claims rest on inference rather than established evidence;
- a conclusion would require legal or specialist judgement;
- a potentially affected group has inadequate evidence coverage;
- the assessment context exceeds the agent's defined methodology or permissions.

The escalation output records the reason; it is not a failure state.

## 12. Error handling and tolerance for error

- Save state after each validated material response.
- Never discard a user's entered answer because a model call fails.
- If model generation fails, present the deterministic next question with a clear status message.
- If persistence fails, tell the user the answer was not saved and keep it in the interface for retry.
- Do not expose backend credentials, database errors containing sensitive content, or model-internal reasoning.
- The user can review previous answers and correct them through the existing BiasLens record, preserving audit history.

## 13. Accessibility and Universal Design

Minimum gate: WCAG 2.2 AA. Target: AAA where feasible.

Milestone 1 requires:

- semantic heading/landmark structure;
- native labelled form controls;
- keyboard-only completion;
- visible high-contrast focus;
- no colour-only Evidence State/status communication;
- text equivalents for all symbols and statuses;
- `aria-live`/status announcements for save/generation feedback without excessive interruption;
- error messages associated with the affected field/action;
- logical focus movement when the next question is presented;
- responsive reflow at 320 CSS pixels and 200% zoom;
- reduced-motion support;
- no nested scrolling requirement for the assessment conversation;
- voice, when later added, remains optional and never auto-submits recognised speech;
- low-effort interaction with one primary question/action at a time.

## 14. Technology

Reuse the existing BiasLens production stack:

- Next.js 16.2.9 + TypeScript;
- React 19;
- Supabase/PostgreSQL + Auth + RLS;
- Vercel hosting;
- Vercel AI SDK / AI Gateway where appropriate;
- Vitest;
- existing BeAccessible design tokens and accessible component patterns.

No new agent SaaS, vector database, telemetry platform, or workflow subscription is required for Milestone 1.

## 15. Milestone 1 acceptance

Milestone 1 succeeds when a signed-in authorised user can start/resume the agent-led workflow, answer only valid adaptive BiasLens questions, preserve uncertainty, save material responses into BiasLens Core with audit provenance, receive a structured evidence-grounded summary, and be routed to human review where needed while the existing manual assessment and public Guide remain functional.
