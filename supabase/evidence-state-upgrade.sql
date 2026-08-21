-- BiasLens evidence-state upgrade
-- Prepared: 2026-08-21
--
-- Apply only to the Supabase project used by BiasLens after the project has
-- been positively identified.
--
-- Collection status and evidence state are deliberately separate:
--   status         = whether an item was requested / received / refused etc.
--   evidence_state = what the available evidence justifies epistemically.
--
-- This migration is intentionally idempotent so a verified successful run can
-- be repeated safely without recreating the enum or columns.

begin;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typname = 'evidence_state'
  ) then
    create type public.evidence_state as enum (
      'established',
      'derived',
      'inferred',
      'unknown',
      'conflicted'
    );
  end if;
end
$$;

alter table public.evidence_log_entries
  add column if not exists evidence_state public.evidence_state not null default 'unknown',
  add column if not exists evidence_state_rationale text,
  add column if not exists source_uri text;

comment on column public.evidence_log_entries.evidence_state is
  'Epistemic state of the evidence: established, derived, inferred, unknown, or conflicted. Distinct from evidence collection status.';

comment on column public.evidence_log_entries.evidence_state_rationale is
  'Plain-language explanation for why this evidence state was assigned.';

comment on column public.evidence_log_entries.source_uri is
  'Optional source or provenance URI for the evidence item.';

commit;
