# Document 02 — BiasLens Division Build Roadmap & Agent Architecture

**Status:** Approved architecture — written specification for review  
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

## 7. Evidence State

The agent must preserve the formal BiasLens states once the existing Evidence State foundation is finalised:

- Established
- Derived
- Inferred
- Unknown
- Conflicted

Evidence State must never be communicated by colour alone. Every state requires text, a plain-language explanation and, where recorded, rationale and provenance.

## 8. Assessment conversation model

The agent should minimise redundant questions. It first checks existing assessment context and evidence, then chooses only the next material question required.

Example:

```text
User: We use an AI tool to shortlist applicants.
Agent: What role does the system play in shortlisting: recommendation, ranking, filtering, or automatic exclusion?

User: The vendor says it has been fairness-tested.
Agent: That is currently a claim rather than established evidence. You may upload the validation report, record where it can be obtained, or continue with this gap recorded as Unknown.
```

The agent must not force a false answer where information is unavailable.

## 9. Human review and escalation

The agent may propose that review is needed but must not replace accountable expert judgement. Human review is required or recommended when evidence is materially conflicted, consequential claims are unsupported, the context is unusually high impact, or the model lacks sufficient evidence for a defensible conclusion.

The agent must not issue legal conclusions or automatic compliance verdicts.

## 10. Out of scope for Milestone 1

- telemetry ingestion;
- continuous monitoring;
- runtime execution authority;
- autonomous remediation;
- automatic legal conclusions;
- multi-agent orchestration;
- enterprise billing;
- vendor challenge workflows;
- automated external system actions.

## 11. Technical architecture

### Existing BiasLens Core

- Next.js 16 App Router + TypeScript
- Supabase PostgreSQL
- Supabase Auth
- Row Level Security and app-level role checks
- Vercel hosting

### Agent layer

- TypeScript service/application
- OpenAI Responses API with structured tool calling
- authenticated server-to-server calls into BiasLens Core interfaces
- no direct browser access to privileged service credentials
- explicit tool allow-list
- schema-validated inputs and outputs

The exact deployment topology may be a separate Vercel project while retaining the shared authenticated BiasLens data plane.

## 12. Data flow

```text
Authenticated user
      ↓
BiasLens Agent UI
      ↓
Agent orchestration
      ↓
Read authorised assessment context
      ↓
Model selects next permitted action
      ↓
Validated BiasLens tool call
      ↓
BiasLens Core persistence + audit trail
      ↓
Updated assessment state
      ↓
Accessible user confirmation
```

No model-generated state is authoritative until BiasLens Core validates and stores it.

## 13. Security and privacy

- Reuse BiasLens authentication and authorisation principles.
- Never expose service-role credentials to the browser.
- Restrict agent tools by user and assessment permissions.
- Reject cross-organisation assessment access.
- Record meaningful write operations in an audit trail.
- Minimise personal data and prefer system/process/aggregated evidence.
- Preserve provenance for evidence-derived assertions.
- Require explicit confirmation before consequential or irreversible user-facing actions.

## 14. Error handling and tolerance for error

The user must be able to correct a response, replace evidence, stop, resume and review what the agent recorded. Failed saves must be announced accessibly and must not be represented as successful. The interface must preserve typed content where technically possible after recoverable errors.

## 15. Accessibility and Universal Design requirements

Minimum target: WCAG 2.2 AA; target AAA where practicable.

Required:

- semantic HTML and landmarks;
- complete keyboard operation;
- visible high-contrast focus;
- no colour-only meaning;
- programmatic labels and instructions;
- accessible validation and error summaries;
- ARIA live/status announcements only where appropriate;
- text interaction as the complete baseline;
- voice optional, never required;
- reduced-motion support;
- responsive reflow and zoom support;
- plain-language explanations for evidence states and agent actions;
- logical reading order;
- review/correction before consequential persistence where appropriate;
- low interaction effort and minimal redundant entry;
- accessible uploaded-evidence status and progress feedback.

## 16. Testing strategy

Milestone 1 requires automated tests for tool schemas, access control boundaries, adaptive-question selection contracts, persistence failure handling and summary output structure. It also requires an authenticated end-to-end workflow test covering start, answer, save, resume and summary.

Accessibility verification must include keyboard-only use, focus order/visibility, screen-reader smoke testing, 200% zoom, 320 CSS pixel reflow, status/error announcements, reduced motion and no-colour-only state communication.

## 17. Dependency on current BiasLens foundation

The agent implementation must not assume the draft Evidence State work is final until the existing provenance/Evidence State branch has completed its authenticated workflow, accessibility regression and production build checks. The agent should consume the finalised contract rather than duplicate or fork it.

## 18. Milestone 1 acceptance criteria

Milestone 1 is accepted when an authorised user can complete this journey without the public Guide or manual database work:

```text
Sign in
→ Start agent-led assessment
→ Describe one AI system
→ Answer adaptive questions
→ Record evidence/unknown/conflict states
→ Leave and resume later
→ Review what BiasLens recorded
→ Receive a structured assessment summary
→ See any human-review escalation clearly
```

All saved records must remain attributable, permission-scoped and auditable in BiasLens Core.

## 19. Future milestones

- Milestone 2: richer document/evidence ingestion and evidence extraction.
- Milestone 3: expert-review workflow and assessed report/ADF handoff.
- Milestone 4: telemetry/operational evidence intake.
- Milestone 5: monitoring, reassessment and enterprise controls.

These later milestones must be planned separately after Milestone 1 proves the agent-led assessment model.
