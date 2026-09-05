-- BiasLens Agent Milestone 1
-- Conversation/session state only. Authoritative assessment and evidence data
-- remains in existing BiasLens Core tables.

create table if not exists public.agent_assessment_sessions (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'active'
    check (status in ('active','completed','paused')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (assessment_id, owner_id)
);

create table if not exists public.agent_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.agent_assessment_sessions(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  question_id text,
  created_at timestamptz not null default now()
);

create index if not exists idx_agent_sessions_assessment
  on public.agent_assessment_sessions(assessment_id);
create index if not exists idx_agent_messages_session_created
  on public.agent_messages(session_id, created_at);

drop trigger if exists trg_agent_sessions_updated on public.agent_assessment_sessions;
create trigger trg_agent_sessions_updated
  before update on public.agent_assessment_sessions
  for each row execute function public.set_updated_at();

alter table public.agent_assessment_sessions enable row level security;
alter table public.agent_messages enable row level security;

drop policy if exists "agent sessions select own accessible assessment" on public.agent_assessment_sessions;
create policy "agent sessions select own accessible assessment"
  on public.agent_assessment_sessions for select
  to authenticated
  using (
    owner_id = auth.uid()
    and public.can_access_assessment(assessment_id)
  );

drop policy if exists "agent sessions insert own accessible assessment" on public.agent_assessment_sessions;
create policy "agent sessions insert own accessible assessment"
  on public.agent_assessment_sessions for insert
  to authenticated
  with check (
    owner_id = auth.uid()
    and public.can_access_assessment(assessment_id)
  );

drop policy if exists "agent sessions update own accessible assessment" on public.agent_assessment_sessions;
create policy "agent sessions update own accessible assessment"
  on public.agent_assessment_sessions for update
  to authenticated
  using (
    owner_id = auth.uid()
    and public.can_access_assessment(assessment_id)
  )
  with check (
    owner_id = auth.uid()
    and public.can_access_assessment(assessment_id)
  );

drop policy if exists "agent messages select through owned session" on public.agent_messages;
create policy "agent messages select through owned session"
  on public.agent_messages for select
  to authenticated
  using (
    exists (
      select 1
      from public.agent_assessment_sessions s
      where s.id = session_id
        and s.owner_id = auth.uid()
        and public.can_access_assessment(s.assessment_id)
    )
  );

drop policy if exists "agent messages insert through owned session" on public.agent_messages;
create policy "agent messages insert through owned session"
  on public.agent_messages for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.agent_assessment_sessions s
      where s.id = session_id
        and s.owner_id = auth.uid()
        and public.can_access_assessment(s.assessment_id)
    )
  );

revoke all on public.agent_assessment_sessions from anon;
revoke all on public.agent_messages from anon;
grant select, insert, update on public.agent_assessment_sessions to authenticated;
grant select, insert on public.agent_messages to authenticated;
