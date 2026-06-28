-- ============================================================
-- BiasLens — database schema (MVP / Sprint 1)
-- PostgreSQL (Supabase). Already applied to the live project.
-- Run order: enums -> tables -> functions/triggers -> RLS -> seed.
-- ============================================================

-- ---------- Enums ----------
create type public.user_role as enum
  ('civil_society','business','government','affected_individual','admin');
create type public.member_role as enum ('owner','admin','member');
create type public.assessment_status as enum
  ('draft','in_review','completed','exported','archived');
create type public.evidence_status as enum
  ('not_requested','requested','partially_received','received',
   'refused','appealed','escalated','not_applicable');

-- ---------- Shared helper ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public, pg_temp as $$
begin new.updated_at = now(); return new; end; $$;

-- ---------- Identity & tenancy ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text, email text, role public.user_role,
  onboarded boolean not null default false,
  is_super_admin boolean not null default false,
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

create table public.organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_org_updated before update on public.organisations
  for each row execute function public.set_updated_at();

create table public.organisation_members (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  member_role public.member_role not null default 'member',
  created_at timestamptz not null default now(),
  unique (organisation_id, user_id)
);

-- ---------- Assessments ----------
create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  organisation_id uuid references public.organisations(id) on delete set null,
  title text not null default 'Untitled assessment',
  assessment_type text not null default 'investigation',
  role_context public.user_role,
  status public.assessment_status not null default 'draft',
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_assessments_updated before update on public.assessments
  for each row execute function public.set_updated_at();

create table public.assessment_status_history (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  from_status public.assessment_status, to_status public.assessment_status not null,
  changed_by uuid references public.profiles(id) on delete set null,
  note text, changed_at timestamptz not null default now()
);

create table public.ai_system_profiles (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null unique references public.assessments(id) on delete cascade,
  system_name text, provider text, deployer text, vendor text, purpose text,
  decision_domain text, deployment_context text,
  affected_populations text[] not null default '{}',
  data_sources text, oversight_model text, human_review text,
  geographies text[] not null default '{}',
  eu_reach boolean, sensitive_data boolean, children_vulnerable boolean,
  public_authority boolean, rights_affected text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_ai_profile_updated before update on public.ai_system_profiles
  for each row execute function public.set_updated_at();

create table public.questionnaire_responses (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null unique references public.assessments(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  current_step integer not null default 0,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_questionnaire_updated before update on public.questionnaire_responses
  for each row execute function public.set_updated_at();

create table public.risk_classifications (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null unique references public.assessments(id) on delete cascade,
  sa_tier text, eu_classification text, eu_annex_category text,
  ibm_bias_scores jsonb not null default '{}'::jsonb,
  sa_pillar_alignment jsonb not null default '{}'::jsonb,
  triggered_obligations jsonb not null default '[]'::jsonb,
  rationale jsonb not null default '[]'::jsonb,
  remediation jsonb not null default '[]'::jsonb,
  overrides jsonb not null default '{}'::jsonb,
  reviewed boolean not null default false,
  reviewed_by uuid references public.profiles(id) on delete set null,
  generated_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_risk_updated before update on public.risk_classifications
  for each row execute function public.set_updated_at();

create table public.evidence_log_entries (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  document_name text not null, source text, requested_from text,
  date_requested date, date_received date,
  status public.evidence_status not null default 'not_requested',
  legal_basis text, notes text, follow_up_date date, file_path text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_evidence_updated before update on public.evidence_log_entries
  for each row execute function public.set_updated_at();

create table public.generated_documents (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  doc_type text not null, format text not null, storage_path text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------- Editable legal/admin content ----------
create table public.legal_frameworks (
  id uuid primary key default gen_random_uuid(),
  code text not null unique, name text not null, jurisdiction text not null,
  description text, active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_frameworks_updated before update on public.legal_frameworks
  for each row execute function public.set_updated_at();

create table public.legal_references (
  id uuid primary key default gen_random_uuid(),
  framework_id uuid not null references public.legal_frameworks(id) on delete cascade,
  ref_code text not null, title text not null, summary text, plain_language text,
  deadline date, url text, active boolean not null default true,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_refs_updated before update on public.legal_references
  for each row execute function public.set_updated_at();

create table public.sample_systems (
  id uuid primary key default gen_random_uuid(),
  name text not null, domain text not null, description text,
  affected_groups text[] not null default '{}',
  prefill jsonb not null default '{}'::jsonb,
  is_demo boolean not null default true, active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.admin_content_changes (
  id uuid primary key default gen_random_uuid(),
  table_name text not null, record_id uuid,
  editor_id uuid references public.profiles(id) on delete set null,
  previous_value jsonb, new_value jsonb, reason text,
  changed_at timestamptz not null default now()
);

create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null, entity_type text, entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------- Functions & triggers ----------
create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public stable as $$
  select coalesce((select role = 'admin' or is_super_admin
                   from public.profiles where id = auth.uid()), false);
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

create or replace function public.can_access_assessment(a_id uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.assessments a
    where a.id = a_id and (
      a.owner_id = auth.uid() or public.is_admin()
      or (a.organisation_id is not null and exists (
        select 1 from public.organisation_members m
        where m.organisation_id = a.organisation_id and m.user_id = auth.uid())))
  );
$$;
revoke all on function public.can_access_assessment(uuid) from public, anon;
grant execute on function public.can_access_assessment(uuid) to authenticated;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email,
          coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'))
  on conflict (id) do nothing;
  return new;
end; $$;
revoke all on function public.handle_new_user() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Row Level Security ----------
-- (See full policy set applied in the live project: owners/org-members/admins
--  for assessment data; read-all + admin-write for reference content; admin or
--  self for audit logs.) Enable RLS on every table and create matching policies.
-- This file documents the structure; policies are reproduced in
-- supabase/policies.sql.
