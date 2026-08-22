# BiasLens Assess — Milestone 1 Verification Record

**Date:** 22 August 2026  
**Branch:** `biaslens-agent-division-foundation`  
**Pull request:** #17  
**Status:** Draft implementation; database foundation restored and hardened; authenticated release verification still required

## Implemented scope

Milestone 1 now contains:

- deterministic adaptive questioning using the existing BiasLens questionnaire and branching rules;
- preservation of `Not sure` as a distinct answer state;
- BiasLens Agent session and message schema with Row Level Security policies;
- controlled persistence into BiasLens Core assessment and evidence records;
- code-enforced prohibition on invented methodology questions and automatic compliance / biased-unbiased / `ALLOW` / `BLOCK` verdicts;
- human-review escalation for consequential domains with unresolved Unknown or Conflicted evidence;
- authenticated assessment API with generic error responses that do not echo submitted assessment text;
- accessible one-question-at-a-time assessment interface;
- text-visible Evidence State communication;
- structured evidence summary separating Established, Unknown and Conflicted evidence;
- assessment-overview entry point for starting or continuing BiasLens Agent;
- dedicated `BiasLens Agent CI` verification workflow.

## Automated verification

The agent-specific test suites cover methodology and adaptive question selection, persistence-boundary validation, orchestration guardrails, structured summary behaviour, authenticated API behaviour, and accessible UI source-level regression requirements.

The dedicated CI gate also runs TypeScript validation with `npx tsc --noEmit` and the Next.js production build with `npm run build`.

**Latest verified gate:** BiasLens Agent CI run 15 completed successfully on 22 August 2026. The focused BiasLens Agent tests, TypeScript validation and production build all completed successfully.

A Vercel Preview deployment is created automatically from the branch. A `READY` deployment proves that Vercel successfully built and published that commit; it does not by itself prove the authenticated database workflow works end to end. Runtime error inspection on 22 August 2026 found no Vercel runtime errors in the preceding hour.

## Database restoration and hardening status

The Supabase project connected to BiasLens was inspected on 22 August 2026. The BiasLens Core tables were absent while unrelated BeAccessible product tables remained present. The restore was therefore performed additively and non-destructively: existing non-BiasLens tables and records were not dropped.

The following migrations were successfully applied and recorded in Supabase migration history:

- `restore_biaslens_core_20260822`
- `restore_biaslens_evidence_state_20260822`
- `restore_biaslens_agent_milestone_1_20260822`
- `harden_biaslens_table_grants_20260822`

Post-migration inspection verified that the BiasLens Core assessment tables, questionnaire, risk, evidence, generated-document, legal/reference, activity, agent session and agent message tables exist with Row Level Security enabled. The shared `profiles` table was extended with BiasLens fields rather than replaced. A trigger protects BiasLens authorization fields from self-escalation while preserving the existing shared profile bootstrap.

Evidence State fields `evidence_state`, `evidence_state_rationale`, and `source_uri` were verified on `public.evidence_log_entries`. Agent RLS policies were verified on `agent_assessment_sessions` and `agent_messages`.

A post-restore grants review found that Supabase default grants had given `authenticated` broad privileges including `TRUNCATE` on restored BiasLens tables. The hardening migration revoked broad table grants and re-granted only the application operations supported by the RLS policies. Verification confirmed `authenticated` no longer has `TRUNCATE` on `assessments` or `agent_messages`, and does not have `DELETE` on `agent_messages` while retaining the required `INSERT` permission.

Supabase security advisors still report warnings for the intentionally authenticated `SECURITY DEFINER` helper functions `public.is_admin()` and `public.can_access_assessment(uuid)`. These helpers are currently required by BiasLens RLS policies and expose only authorization predicates; they are not being treated as a release blocker without a safer policy refactor. Separate pre-existing advisor findings exist for unrelated toolkit/PMBA objects in the shared project.

This restoration recreates the BiasLens database structure and current agent/evidence extensions. It does **not** claim recovery of historical BiasLens rows that were no longer present in the database before restoration.

## Current authenticated-test blocker

As of 22 August 2026, `auth.users` contains zero users. Therefore a genuine signed-in add/save/leave/resume journey cannot yet be evidenced. The application already exposes signup, password sign-in, magic-link sign-in, password reset and auth callback flows through Supabase Auth. Creating the first real BiasLens account requires control of an email inbox so the signup or magic-link email can be confirmed.

## Known repository-level blocker outside this work

The legacy whole-repository CI currently contains a pre-existing failure in `src/components/guide/normal-chatbot-regression.test.ts`. The failing assertion concerns placement detection for the public BiasLens Guide read-aloud controls. The new BiasLens Assess work does not modify that public Guide behaviour. The issue is tracked separately as GitHub issue #18.

## Manual verification still required before production merge

Do not mark Milestone 1 production-ready until all of the following are evidenced:

1. create and confirm the first authorised BiasLens Auth account;
2. sign in to the Vercel Preview with that authorised BiasLens account;
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
14. resolve issue #18 or confirm merge policy allows the formally separated pre-existing Guide regression.

## Accessibility Compliance Note

Milestone 1 is designed to a WCAG 2.2 Level AA release minimum and targets Level AAA where feasible. Implemented measures include semantic headings and regions, native form controls, programmatic labels and legends, visible text for all Evidence States, a `Not sure` path, status and error semantics, focus movement to each new question, disabled duplicate submission during network activity, 48-pixel minimum action/choice targets, no colour-only meaning, one-question-at-a-time interaction, and an ordinary collapsible review section rather than nested scrolling. Manual screen-reader, zoom/reflow, cross-browser and full keyboard journey verification remains outstanding and no stronger accessibility-conformance claim should be made until those tests are completed.
