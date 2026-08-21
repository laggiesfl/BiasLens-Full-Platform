-- BiasLens evidence-state upgrade
-- Prepared: 2026-08-21
--
-- IMPORTANT:
-- Apply only to the Supabase project used by BiasLens after the project has
-- been positively identified. The currently connected Supabase project in
-- ChatGPT does not match the BiasLens schema, so this script is intentionally
-- committed but not executed against that unrelated project.
--
-- Collection status and evidence state are deliberately separate:
--   status         = whether an item was requested / received / refused etc.
--   evidence_state = what the available evidence justifies epistemically.

begin;

create type public.evidence_state as enum (
  'established',
  'derived',
  'inferred',
  'unknown',
  'conflicted'
);

alter table public.evidence_log_entries
  add column evidence_state public.evidence_state not null default 'unknown',
  add column evidence_state_rationale text,
  add column source_uri text;

comment on column public.evidence_log_entries.evidence_state is
  'Epistemic state of the evidence: established, derived, inferred, unknown, or conflicted. Distinct from evidence collection status.';

comment on column public.evidence_log_entries.evidence_state_rationale is
  'Plain-language explanation for why this evidence state was assigned.';

comment on column public.evidence_log_entries.source_uri is
  'Optional source or provenance URI for the evidence item.';

commit;
