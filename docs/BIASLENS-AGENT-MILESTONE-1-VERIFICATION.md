# BiasLens Assess — Milestone 1 Verification Record

**Date:** 22 August 2026  
**Branch:** `biaslens-agent-division-foundation`  
**Pull request:** #17  
**Status:** Draft implementation; not approved for production merge

## Implemented scope

Milestone 1 now contains:

- deterministic adaptive questioning using the existing BiasLens questionnaire and branching rules;
- preservation of `Not sure` as a distinct answer state;
- BiasLens Agent session and message schema with Row Level Security policies prepared in `supabase/biaslens-agent-milestone-1.sql`;
- controlled persistence into existing BiasLens Core assessment and evidence records;
- code-enforced prohibition on invented methodology questions and automatic compliance / biased-unbiased / `ALLOW` / `BLOCK` verdicts;
- human-review escalation for consequential domains with unresolved Unknown or Conflicted evidence;
- authenticated assessment API with generic error responses that do not echo submitted assessment text;
- accessible one-question-at-a-time assessment interface;
- text-visible Evidence State communication;
- structured evidence summary separating Established, Unknown and Conflicted evidence;
- assessment-overview entry point for starting or continuing BiasLens Agent;
- dedicated `BiasLens Agent CI` verification workflow.

## Automated verification

The agent-specific test suites cover:

- methodology and adaptive question selection;
- persistence-boundary validation;
- orchestration guardrails;
- structured summary behaviour;
- authenticated API behaviour;
- accessible UI source-level regression requirements.

The dedicated CI gate also runs:

- TypeScript validation with `npx tsc --noEmit`;
- the Next.js production build with `npm run build`.

A Vercel Preview deployment is created automatically from the branch. A `READY` deployment proves that Vercel successfully built and published that commit; it does not by itself prove the authenticated database workflow works end to end.

## Database status and blocker

The agent session migration is committed but has **not been marked as applied** in this verification record.

The connected Supabase action available during this build returned a permission error when asked to run a read-only schema check. Because the database state could not be independently inspected, this work must not claim that `agent_assessment_sessions` or `agent_messages` exist in production until a permitted schema query verifies them.

The earlier BiasLens Evidence State foundation is tracked separately in PR #16. Agent evidence persistence deliberately targets the existing BiasLens Core `evidence_log_entries` record rather than creating a competing evidence model.

## Known repository-level blocker outside this work

The legacy whole-repository CI currently contains a pre-existing failure in:

`src/components/guide/normal-chatbot-regression.test.ts`

The failing assertion concerns placement detection for the public BiasLens Guide read-aloud controls. The new BiasLens Assess work does not modify that public Guide behaviour. The separate BiasLens Agent CI exists so agent tests, TypeScript and build verification can still be evaluated independently while the unrelated regression is addressed separately.

## Manual verification still required before production merge

Do not mark Milestone 1 production-ready until all of the following are evidenced:

1. verify/apply the agent session migration in the intended Supabase project;
2. sign in to the Vercel Preview with an authorised BiasLens account;
3. start or open an assessment and enter BiasLens Agent;
4. complete several answer types, including `Not sure` and a multi-select answer;
5. leave and resume the assessment, confirming persisted progress;
6. verify an inaccessible user cannot read another assessment or its agent session;
7. verify Evidence State updates preserve provenance and audit history;
8. complete keyboard-only testing of the full agent journey;
9. test at 200% zoom and 320 CSS pixels width;
10. run at least one structured screen-reader walkthrough;
11. verify reduced-motion behaviour where motion is present;
12. confirm the structured summary never turns Unknown/Conflicted evidence into stronger claims;
13. retest the existing manual questionnaire and report routes for regression;
14. resolve or formally separate the existing public Guide CI failure before merge policy is satisfied.

## Accessibility Compliance Note

Milestone 1 is designed to a WCAG 2.2 Level AA release minimum and targets Level AAA where feasible. Implemented measures include semantic headings and regions, native form controls, programmatic labels and legends, visible text for all Evidence States, a `Not sure` path, status and error semantics, focus movement to each new question, disabled duplicate submission during network activity, 48-pixel minimum action/choice targets, no colour-only meaning, one-question-at-a-time interaction, and an ordinary collapsible review section rather than nested scrolling. Manual screen-reader, zoom/reflow, cross-browser and full keyboard journey verification remains outstanding and no stronger accessibility-conformance claim should be made until those tests are completed.
