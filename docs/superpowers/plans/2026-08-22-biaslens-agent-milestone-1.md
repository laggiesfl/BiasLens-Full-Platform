# BiasLens Agent Milestone 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first authenticated BiasLens Assess agent-led workflow so a user can start or resume an assessment, answer adaptive BiasLens questions, record evidence posture, and receive a structured assessment summary without allowing the model to become the authoritative evidence store.

**Architecture:** Implement the agent as an isolated `src/lib/agent` subsystem and authenticated `/assessments/[id]/agent` experience inside the existing BiasLens deployment. The agent reads and writes only through validated BiasLens Core service functions backed by the existing Supabase/RLS model. Conversation state is separate from authoritative assessment/evidence records; persistence functions explicitly copy approved answers/evidence posture into BiasLens Core and append activity-log records.

**Tech Stack:** Next.js 16.2.9 App Router, TypeScript 5.5, React 19, Vercel AI SDK 6, Vercel AI Gateway, Supabase/PostgreSQL + RLS, Vitest 2.1.8, existing BeAccessible design tokens.

**Spec:** `docs/superpowers/specs/2026-08-22-biaslens-agent-assessment-design.md`

## Global Constraints

- The agent does not own the evidence record; BiasLens Core does.
- The public BiasLens Guide and authenticated BiasLens Assessment Agent remain separate experiences.
- No automatic legal conclusion, discrimination verdict, compliance verdict, or runtime ALLOW/BLOCK decision.
- Evidence States are: `established`, `derived`, `inferred`, `unknown`, `conflicted`.
- Persisted agent actions must preserve user identity, assessment identity, provenance, and an append-only activity record.
- Voice is optional and is not required for Milestone 1.
- WCAG 2.2 AA is the minimum acceptance gate; target AAA where feasible.
- Every meaningful status is exposed in text and never by colour alone.
- Full keyboard operation, visible focus, logical reading order, explicit labels/errors, reduced-motion compatibility, and screen-reader status announcements are required.
- No telemetry intake or continuous monitoring in Milestone 1.
- TDD applies: failing test first, then minimal production code, then full verification.

---

## File Structure

### New agent subsystem
- `src/lib/agent/types.ts` — agent-facing domain types and controlled capability names.
- `src/lib/agent/methodology.ts` — converts existing `QUESTIONNAIRE` configuration into deterministic visible/answered/unanswered question state.
- `src/lib/agent/core-service.ts` — authorised BiasLens Core reads/writes; the only persistence boundary used by the agent.
- `src/lib/agent/prompt.ts` — BiasLens agent instructions and safety/epistemic boundaries.
- `src/lib/agent/orchestrator.ts` — selects the next deterministic question, builds model context, validates model output, and calls Core service functions.
- `src/lib/agent/summary.ts` — creates the structured assessment summary from persisted BiasLens Core state.
- `src/lib/agent/__tests__/methodology.test.ts`
- `src/lib/agent/__tests__/core-service.test.ts`
- `src/lib/agent/__tests__/orchestrator.test.ts`
- `src/lib/agent/__tests__/summary.test.ts`

### New authenticated experience
- `src/app/(app)/assessments/[id]/agent/page.tsx` — server page that authorises the assessment and loads resumable agent state.
- `src/app/(app)/assessments/[id]/agent/AgentAssessment.tsx` — accessible client conversation/workflow UI.
- `src/app/api/assessments/[id]/agent/route.ts` — authenticated POST endpoint for one agent turn.
- `src/app/api/assessments/[id]/agent/__tests__/route.test.ts` — endpoint/auth/validation tests.

### Database migration
- `supabase/biaslens-agent-milestone-1.sql` — conversation/session persistence with RLS; no duplication of the authoritative evidence record.

### Existing files modified
- `src/app/(app)/assessments/[id]/page.tsx` — add a clear “Continue with BiasLens Agent” entry point.
- `src/app/(app)/assessments/page.tsx` — expose agent-led assessment mode without removing the current manual workflow.
- `src/app/globals.css` — agent UI layout/focus/status styles using existing BeAccessible tokens only.
- `README.md` — document agent boundary, required environment variables, and verification flow.
- `src/app/accessibility-statement/page.tsx` — add only verified agent accessibility behaviour after implementation testing.

---

### Task 1: Deterministic Adaptive Question Engine

**Files:**
- Create: `src/lib/agent/types.ts`
- Create: `src/lib/agent/methodology.ts`
- Create: `src/lib/agent/__tests__/methodology.test.ts`
- Read/reuse: `src/lib/questionnaire.ts`

**Interfaces:**
- Consumes: `QUESTIONNAIRE`, `Question`, `Step`, `Answers`, `Role`.
- Produces: `AgentQuestion`, `AssessmentQuestionState`, `getAssessmentQuestionState(role, answers)`, `getNextQuestion(role, answers)`.

- [ ] **Step 1: Write the failing methodology tests**

```ts
import { describe, expect, it } from "vitest";
import { getAssessmentQuestionState, getNextQuestion } from "../methodology";

describe("BiasLens agent methodology", () => {
  it("returns the first visible unanswered required question", () => {
    const next = getNextQuestion("business", {});
    expect(next?.id).toBe("system_name");
    expect(next?.label).toBe("What is the AI system called?");
  });

  it("skips questions already answered", () => {
    const next = getNextQuestion("business", { system_name: "ScreenRight" });
    expect(next?.id).toBe("provider");
  });

  it("respects questionnaire visibility rules", () => {
    const state = getAssessmentQuestionState("affected_individual", {
      system_name: "Unknown screening tool",
      provider: "Unknown",
      deployer: "Employer",
    });
    expect(state.visibleQuestions.some((q) => q.id === "vendor")).toBe(false);
  });

  it("treats unsure as answered rather than silently converting it to no", () => {
    const state = getAssessmentQuestionState("business", {
      system_name: "Tool",
      provider: "Vendor",
      deployer: "Employer",
      vendor: "Vendor",
      purpose: "Shortlists applicants",
      decision_domain: "employment",
      deployment_context: "Recruitment portal",
      affected_populations: ["People with disabilities"],
      children_vulnerable: "unsure",
    });
    expect(state.answeredQuestionIds).toContain("children_vulnerable");
  });
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npm test -- src/lib/agent/__tests__/methodology.test.ts`

Expected: FAIL because `../methodology` does not yet exist.

- [ ] **Step 3: Implement the minimal deterministic question engine**

`AgentQuestion` mirrors only the fields the agent needs: `id`, `stepId`, `stepTitle`, `label`, `type`, `help`, `options`, `required`. `getAssessmentQuestionState` flattens only questions whose `visibleIf` returns true for the current role/answers. A value is answered when it is not `undefined`, `null`, an empty string, or an empty array. `getNextQuestion` returns the first visible unanswered question in questionnaire order.

- [ ] **Step 4: Re-run the focused test and verify GREEN**

Run: `npm test -- src/lib/agent/__tests__/methodology.test.ts`

Expected: all methodology tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/agent/types.ts src/lib/agent/methodology.ts src/lib/agent/__tests__/methodology.test.ts
git commit -m "feat: add deterministic BiasLens agent question engine"
```

---

### Task 2: Agent Session Persistence Without Evidence Duplication

**Files:**
- Create: `supabase/biaslens-agent-milestone-1.sql`
- Create: `src/lib/agent/core-service.ts`
- Create: `src/lib/agent/__tests__/core-service.test.ts`

**Interfaces:**
- Produces database tables `agent_assessment_sessions` and `agent_messages`.
- Produces `getAgentAssessmentContext`, `saveAgentMessage`, `recordAssessmentResponse`, `recordEvidencePosture`.
- All functions accept an authenticated Supabase client plus `assessmentId`; no function accepts a caller-supplied owner/user ID.

- [ ] **Step 1: Write failing service-contract tests**

Test that response validation rejects unknown question IDs, rejects an invalid Evidence State, preserves the literal value `unsure`, and produces activity metadata containing `source: "biaslens_agent"`.

- [ ] **Step 2: Run the focused tests and verify RED**

Run: `npm test -- src/lib/agent/__tests__/core-service.test.ts`

Expected: FAIL because `core-service.ts` does not exist.

- [ ] **Step 3: Add the migration**

Create `agent_assessment_sessions` with: `id uuid primary key default gen_random_uuid()`, `assessment_id uuid not null references assessments(id) on delete cascade`, `owner_id uuid not null references auth.users(id) on delete cascade`, `status text not null default 'active' check (status in ('active','completed','paused'))`, `created_at timestamptz not null default now()`, `updated_at timestamptz not null default now()`, unique `(assessment_id, owner_id)`.

Create `agent_messages` with: `id uuid primary key default gen_random_uuid()`, `session_id uuid not null references agent_assessment_sessions(id) on delete cascade`, `role text not null check (role in ('user','assistant','system'))`, `content text not null`, `question_id text`, `created_at timestamptz not null default now()`.

Enable RLS. Session select/insert/update policies require `owner_id = auth.uid()` and access to the linked assessment. Message policies require ownership through the parent session. Do not create service-role bypass policies in this migration.

- [ ] **Step 4: Implement the Core service boundary**

`recordAssessmentResponse` validates the question against the existing `QUESTIONNAIRE`, merges the answer into the existing `questionnaire_responses.answers` JSON object, and appends an `activity_log` action `agent_assessment_response_recorded` with `question_id` and `source: "biaslens_agent"`.

`recordEvidencePosture` accepts only `established | derived | inferred | unknown | conflicted`; it writes through the existing evidence model once the Evidence State migration from the foundation is present. It never creates a second agent-owned evidence table.

- [ ] **Step 5: Verify GREEN**

Run: `npm test -- src/lib/agent/__tests__/core-service.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add supabase/biaslens-agent-milestone-1.sql src/lib/agent/core-service.ts src/lib/agent/__tests__/core-service.test.ts
git commit -m "feat: add BiasLens agent session and core persistence boundary"
```

---

### Task 3: Controlled Agent Orchestration

**Files:**
- Create: `src/lib/agent/prompt.ts`
- Create: `src/lib/agent/orchestrator.ts`
- Create: `src/lib/agent/__tests__/orchestrator.test.ts`

**Interfaces:**
- Consumes: `getNextQuestion`, persisted assessment context, Core service functions.
- Produces: `runAssessmentTurn(input): Promise<AgentTurnResult>` where result is one of `question`, `summary_ready`, `human_review_required`, or `error`.

- [ ] **Step 1: Write failing orchestration tests**

Test these behaviours: the next question is selected deterministically; a model cannot invent a question ID; claims of “compliant”, “unbiased”, “illegal discrimination proven”, `ALLOW`, or `BLOCK` are rejected from structured findings; an `unknown` answer remains a legitimate result; consequential ambiguity can return `human_review_required`.

- [ ] **Step 2: Verify RED**

Run: `npm test -- src/lib/agent/__tests__/orchestrator.test.ts`

Expected: FAIL because the orchestrator does not exist.

- [ ] **Step 3: Add the BiasLens agent instruction contract**

The prompt must state: distinguish evidence from claim; never manufacture missing evidence; preserve Unknown and Conflicted states; ask one question at a time; explain why a question matters in plain language when useful; never produce a legal/compliance verdict; never issue execution authority; recommend human review when evidence or context exceeds the system boundary.

- [ ] **Step 4: Implement orchestration with structured output validation**

The deterministic methodology engine chooses the permitted question. The model may only generate plain-language conversational framing and evidence-gap explanation around that permitted question. Any structured output must be validated against a local TypeScript union before persistence.

- [ ] **Step 5: Verify GREEN**

Run: `npm test -- src/lib/agent/__tests__/orchestrator.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/agent/prompt.ts src/lib/agent/orchestrator.ts src/lib/agent/__tests__/orchestrator.test.ts
git commit -m "feat: add controlled BiasLens assessment orchestration"
```

---

### Task 4: Authenticated Agent API

**Files:**
- Create: `src/app/api/assessments/[id]/agent/route.ts`
- Create: `src/app/api/assessments/[id]/agent/__tests__/route.test.ts`

**Interfaces:**
- POST body: `{ message?: string; questionId?: string; answer?: string | string[] | boolean; evidencePosture?: { state: EvidenceState; rationale: string; sourceUri?: string } }`.
- Response: `{ type, message, question?, progress?, summary?, humanReview? }`.

- [ ] **Step 1: Write failing route tests**

Test unauthenticated `401`, malformed request `400`, inaccessible assessment `404`, valid answer `200`, and returned errors using safe generic text without echoing sensitive free-text input.

- [ ] **Step 2: Verify RED**

Run: `npm test -- src/app/api/assessments/[id]/agent/__tests__/route.test.ts`

Expected: FAIL because the route does not exist.

- [ ] **Step 3: Implement the POST endpoint**

Authenticate with the existing server Supabase client, verify RLS-visible assessment access, validate request shape, call `runAssessmentTurn`, and return JSON. The endpoint does not expose service-role credentials or bypass RLS.

- [ ] **Step 4: Verify GREEN**

Run: `npm test -- src/app/api/assessments/[id]/agent/__tests__/route.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/assessments/[id]/agent/route.ts src/app/api/assessments/[id]/agent/__tests__/route.test.ts
git commit -m "feat: add authenticated BiasLens assessment agent API"
```

---

### Task 5: Accessible Agent Assessment Interface

**Files:**
- Create: `src/app/(app)/assessments/[id]/agent/page.tsx`
- Create: `src/app/(app)/assessments/[id]/agent/AgentAssessment.tsx`
- Modify: `src/app/(app)/assessments/[id]/page.tsx`
- Modify: `src/app/(app)/assessments/page.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Page loads existing assessment/session context server-side.
- Client sends one answer at a time to the authenticated agent API.

- [ ] **Step 1: Add UI contract tests or pure rendering-state tests before implementation**

Cover: current question has a real `<label>`; submit is disabled while sending; server status uses `role="status"`/`aria-live="polite"`; errors use `role="alert"`; Evidence State is rendered as visible text; “Not sure” remains selectable; focus moves to the new question heading after a successful turn; all actions are native buttons/links.

- [ ] **Step 2: Verify RED**

Run the focused Vitest file for the UI-state helper/components and confirm expected failure because the agent UI does not exist.

- [ ] **Step 3: Implement the authenticated page and client workflow**

UI contains one primary question at a time, a short visible progress statement, optional help/explanation, answer controls matching the source questionnaire type, `Save and leave`, and a persistent link back to the assessment overview. Do not create a chat transcript that forces users to scroll through every previous turn; prior answers are available in a collapsible review region.

- [ ] **Step 4: Apply Universal Design requirements**

Use the existing BeAccessible palette/tokens. Maintain minimum 44x44 CSS-pixel interactive targets where practical. Avoid nested scroll areas. Ensure 200% zoom and 320px reflow do not create horizontal page scrolling. Respect `prefers-reduced-motion`. Do not use colour as the only Evidence State cue.

- [ ] **Step 5: Verify component/unit tests**

Run: `npm test`

Expected: zero failures.

- [ ] **Step 6: Commit**

```bash
git add 'src/app/(app)/assessments/[id]/agent' 'src/app/(app)/assessments/[id]/page.tsx' 'src/app/(app)/assessments/page.tsx' src/app/globals.css
git commit -m "feat: add accessible BiasLens agent assessment experience"
```

---

### Task 6: Structured Assessment Summary and Human Review Escalation

**Files:**
- Create: `src/lib/agent/summary.ts`
- Create: `src/lib/agent/__tests__/summary.test.ts`
- Modify: `src/lib/agent/orchestrator.ts`
- Modify: `src/app/(app)/assessments/[id]/agent/AgentAssessment.tsx`

**Interfaces:**
- Produces `AssessmentAgentSummary` containing `systemContext`, `answeredCount`, `remainingCount`, `establishedEvidence`, `unknowns`, `conflicts`, `potentialBiasPathways`, `recommendedNextActions`, `humanReviewRequired`, `limitations`.

- [ ] **Step 1: Write failing summary tests**

Require Unknown and Conflicted items to appear as prominently as Established evidence; require every potential bias pathway to include a rationale/limitation; prohibit a binary “biased/not biased” field; require human-review reason text when `humanReviewRequired` is true.

- [ ] **Step 2: Verify RED**

Run: `npm test -- src/lib/agent/__tests__/summary.test.ts`

Expected: FAIL because `summary.ts` does not exist.

- [ ] **Step 3: Implement the summary from persisted data only**

The summary reads existing assessment profile, questionnaire answers, evidence log, Evidence State, and relevant risk outputs. Model-authored explanatory prose may be added only after the structured facts are assembled; it cannot alter the underlying counts/states.

- [ ] **Step 4: Verify GREEN**

Run: `npm test -- src/lib/agent/__tests__/summary.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/agent/summary.ts src/lib/agent/__tests__/summary.test.ts src/lib/agent/orchestrator.ts 'src/app/(app)/assessments/[id]/agent/AgentAssessment.tsx'
git commit -m "feat: add evidence-grounded BiasLens agent summary"
```

---

### Task 7: Documentation, Accessibility Verification, and Production Gate

**Files:**
- Modify: `README.md`
- Modify after verification only: `src/app/accessibility-statement/page.tsx`
- Add: `docs/biaslens-agent-milestone-1-verification.md`

- [ ] **Step 1: Run the complete automated test suite**

Run: `npm test`

Expected: 0 failed tests.

- [ ] **Step 2: Run the production build**

Run: `npm run build`

Expected: exit code 0 with the authenticated `/assessments/[id]/agent` page and API route included.

- [ ] **Step 3: Verify the Supabase migration in the BiasLens project**

Confirm tables, constraints, RLS enabled status, and policies. Confirm an authenticated user cannot read or write another user's agent session/messages.

- [ ] **Step 4: Verify the Vercel preview end-to-end**

Use a fictional assessment only. Verify: start/resume; one-question-at-a-time interaction; `unsure`; save/leave/resume; Evidence State text; Unknown/Conflicted handling; no duplicate evidence record; human-review escalation; error recovery.

- [ ] **Step 5: Perform accessibility regression**

Verify keyboard-only operation; visible focus; 200% zoom; 320px reflow; reduced motion; labels/instructions; live status/error announcements; no colour-only state; no nested scrolling; no mouse-only action. Record what was and was not tested.

- [ ] **Step 6: Update documentation using only verified claims**

README documents the agent/Core boundary and environment/runtime dependencies. Accessibility Statement adds the agent only for behaviours actually verified in Steps 4–5, and retains explicit limitations for untested assistive technologies or browsers.

- [ ] **Step 7: Commit**

```bash
git add README.md src/app/accessibility-statement/page.tsx docs/biaslens-agent-milestone-1-verification.md
git commit -m "docs: record BiasLens agent milestone 1 verification"
```

- [ ] **Step 8: Open a draft pull request**

PR title: `BiasLens Assess agent-led assessment — Milestone 1`

The PR remains draft until automated tests, build, authenticated preview, Supabase RLS checks, and accessibility regression evidence are all recorded.

---

## Acceptance Criteria

Milestone 1 is ready for production review only when all of the following are evidenced:

1. A signed-in authorised user can start and resume an agent-led assessment.
2. The agent asks only questions that exist in the approved BiasLens methodology and are visible for the user's role/context.
3. Existing answers are not unnecessarily re-requested.
4. `Not sure`, Unknown, and Conflicted are preserved as valid epistemic states.
5. The agent cannot create an authoritative evidence record outside BiasLens Core.
6. Every persisted answer/evidence-posture action is auditable.
7. The agent produces no automatic legal, compliance, discrimination, ALLOW, or BLOCK verdict.
8. The structured summary distinguishes evidence, unknowns, conflicts, potential bias pathways, limitations, and recommended next actions.
9. Matters outside the agent's evidence boundary can be escalated for human review.
10. The existing manual assessment path continues to work.
11. The public BiasLens Guide remains separate and unaffected.
12. Automated tests and production build pass.
13. RLS isolation is verified with two-user access checks.
14. Keyboard, focus, reflow, zoom, reduced-motion, status/error semantics, and non-colour state communication are verified on the preview.

## Accessibility Compliance Note

This plan treats accessibility and Universal Design as release criteria, not later remediation. The Milestone 1 interface targets WCAG 2.2 AA as a minimum and AAA where feasible through semantic structure, keyboard operability, perceptible text-based status, robust labels/errors, focus management, reflow, reduced-motion support, low interaction effort, and tolerance for uncertainty/error. Screen-reader and cross-browser claims must not be added to the Accessibility Statement until verified with the actual implementation.