# BiasLens Guide Design Specification

## Summary
BiasLens Guide is a multilingual, accessible, voice-enabled public chatbot integrated directly into the existing BiasLens Next.js platform. It explains BiasLens, algorithmic accountability, evidence readiness, accessibility, and the “Assess One AI System” qualification route while remaining strictly separated from private assessment data and authenticated user content.

## Goals
- Native public chatbot inside the existing BiasLens platform.
- Six launch languages: English, isiZulu, isiXhosa, Afrikaans, French, Spanish.
- Text, optional voice input, and optional read-aloud output.
- Controlled AI terminology governance, especially for South African languages.
- Public-only knowledge boundary with no access to private assessment data.
- WCAG 2.2 AA minimum target, with AAA practices where practicable.

## Architecture
- Dedicated `/guide` page.
- Public launcher included through `PublicHeader` only.
- `POST /api/guide` server route.
- Local controlled knowledge and terminology modules in `src/lib/guide`.
- OpenAI model requests routed through Vercel AI Gateway using `VERCEL_OIDC_TOKEN` in production, with `AI_GATEWAY_API_KEY` or `OPENAI_API_KEY` fallback for non-Vercel environments.
- No connection from the Guide route to Supabase assessment records, uploaded evidence, or authenticated account data.

## Language and terminology
English remains the canonical source. The Guide supports explicit language selection and natural-language switching. Protected names such as BiasLens and BeAccessible remain untranslated. For isiZulu, isiXhosa, and Afrikaans, standardised South African AI terminology should be preferred where available; product-specific terms remain in English until approved translations exist. Translation must preserve evidence strength, uncertainty, legal boundaries, and accessibility meaning.

## Voice
Voice input is optional, user-initiated, visibly indicated, and transcribed before submission. Users can edit, retry, cancel, or send the transcript. Read-aloud is also optional and user-initiated, with pause/resume/stop and rate controls where the browser supports them. Text always remains available.

## Safety and privacy boundaries
The Guide never makes legal findings, guarantees compliance, declares a system bias-free, assesses named individuals, or requests person-level sensitive data. It does not expose or read private BiasLens assessment data.

## Accessibility
The interface must be keyboard operable, have visible focus, use semantic labels, avoid colour-only meaning, provide correct language metadata, keep text equivalents for voice, and avoid automatic audio. Accessibility claims require testing.

## Acceptance criteria
- `/guide` renders and is reachable from public navigation.
- Public launcher opens the Guide.
- Six languages are selectable.
- Voice input/read-aloud work where browser APIs are available and degrade safely where unavailable.
- Chat responses are grounded in the approved BiasLens knowledge base.
- The route is isolated from authenticated assessment data.
- Error states are clear and accessible.

## Accessibility Compliance Note
This design applies Universal Design principles and targets WCAG 2.2 Level AA as the minimum implementation standard, with AAA-level practices where practicable. Full conformance must be verified through testing, not assumed from code alone.
