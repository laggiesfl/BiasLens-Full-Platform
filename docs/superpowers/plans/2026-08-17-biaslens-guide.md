# BiasLens Guide Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a native multilingual, voice-enabled, accessible BiasLens Guide inside the existing BiasLens Next.js platform.

**Architecture:** A reusable client chat component powers both a dedicated `/guide` page and a public launcher. A server-only `/api/guide` route assembles the controlled knowledge and terminology context and calls an OpenAI model through Vercel AI Gateway/OIDC in production, without any connection to private assessment data.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Vercel AI Gateway/OpenResponses-compatible API, browser Web Speech APIs, Vitest.

## Global Constraints
- Product name: **BiasLens Guide**.
- Supported languages: English, isiZulu, isiXhosa, Afrikaans, French, Spanish.
- English is the canonical knowledge source.
- Protected names BiasLens and BeAccessible remain untranslated.
- The Guide must not access authenticated assessment records, uploaded evidence, or person-level datasets.
- Voice must remain optional and user-controlled.
- Target WCAG 2.2 AA minimum and AAA where practicable.
- Never claim legal conclusions, guaranteed compliance, or that a system is bias-free.

---

### Task 1: Controlled knowledge and language configuration
**Files:**
- Create `src/lib/guide/languages.ts`
- Create `src/lib/guide/knowledge.ts`

- [ ] Define supported language codes, labels, speech locales, starter questions, and UI copy.
- [ ] Add the approved BiasLens public knowledge, boundaries, evidence-strength vocabulary, and terminology rules.
- [ ] Export a deterministic system instruction builder.

### Task 2: Server API route
**Files:**
- Create `src/app/api/guide/route.ts`

- [ ] Validate messages and language.
- [ ] Reject empty/oversized requests.
- [ ] Build model context only from public knowledge.
- [ ] Call Vercel AI Gateway with `VERCEL_OIDC_TOKEN`/`AI_GATEWAY_API_KEY`, falling back to direct OpenAI only when `OPENAI_API_KEY` is present.
- [ ] Return plain JSON `{ text, language }` and accessible error messages.

### Task 3: Accessible chat and voice UI
**Files:**
- Create `src/components/guide/BiasLensGuide.tsx`
- Create `src/components/guide/BiasLensGuide.module.css`

- [ ] Build keyboard-operable message history, language selector, starter questions, text composer, and status region.
- [ ] Add microphone input using browser speech recognition when supported, with transcript confirmation before sending.
- [ ] Add user-initiated speech synthesis with pause/resume/stop and rate controls.
- [ ] Ensure no automatic audio and visible text remains available.

### Task 4: Public entry points
**Files:**
- Create `src/app/guide/page.tsx`
- Create `src/components/guide/GuideLauncher.tsx`
- Modify `src/components/public/PublicHeader.tsx`

- [ ] Add dedicated `/guide` page with PublicHeader.
- [ ] Add public navigation link and launcher.
- [ ] Keep launcher limited to public pages by mounting it through PublicHeader rather than root layout.

### Task 5: Environment documentation and verification
**Files:**
- Modify `.env.example`
- Add/update tests under `src/lib/guide/*.test.ts` as appropriate.

- [ ] Document `AI_GATEWAY_API_KEY` and `OPENAI_API_KEY` local fallback options; production Vercel can use OIDC automatically.
- [ ] Verify TypeScript/build and test suite.
- [ ] Verify public route and launcher behaviour.
- [ ] Verify keyboard access, visible focus, language switching, no autoplay audio, and safe voice fallback.
- [ ] Deploy to Vercel production after verification.

## Accessibility Compliance Note
Implementation must preserve semantic structure, keyboard operation, visible focus, correct language metadata, non-audio alternatives, explicit microphone state, transcript confirmation, user-controlled speech output, clear errors, and screen-reader-compatible labels. Accessibility conformance is verified through testing rather than inferred from implementation.
