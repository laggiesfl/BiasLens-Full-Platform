-- ============================================================
-- BiasLens — Row Level Security policies (already applied live)
-- ============================================================

alter table public.profiles enable row level security;
alter table public.organisations enable row level security;
alter table public.organisation_members enable row level security;
alter table public.assessments enable row level security;
alter table public.assessment_status_history enable row level security;
alter table public.ai_system_profiles enable row level security;
alter table public.questionnaire_responses enable row level security;
alter table public.risk_classifications enable row level security;
alter table public.evidence_log_entries enable row level security;
alter table public.generated_documents enable row level security;
alter table public.legal_frameworks enable row level security;
alter table public.legal_references enable row level security;
alter table public.sample_systems enable row level security;
alter table public.admin_content_changes enable row level security;
alter table public.activity_log enable row level security;

-- Profiles: self or admin
create policy profiles_select_own on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());
create policy profiles_update_own on public.profiles for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- Organisations & members
create policy orgs_select on public.organisations for select to authenticated using (
  public.is_admin() or created_by = auth.uid()
  or exists (select 1 from public.organisation_members m
             where m.organisation_id = id and m.user_id = auth.uid()));
create policy orgs_insert on public.organisations for insert to authenticated
  with check (created_by = auth.uid());
create policy orgs_update on public.organisations for update to authenticated using (
  public.is_admin() or created_by = auth.uid()
  or exists (select 1 from public.organisation_members m
             where m.organisation_id = id and m.user_id = auth.uid()
               and m.member_role in ('owner','admin')));

create policy org_members_select on public.organisation_members for select to authenticated using (
  public.is_admin() or user_id = auth.uid()
  or exists (select 1 from public.organisations o where o.id = organisation_id and o.created_by = auth.uid()));
create policy org_members_insert on public.organisation_members for insert to authenticated with check (
  public.is_admin()
  or exists (select 1 from public.organisations o where o.id = organisation_id and o.created_by = auth.uid()));
create policy org_members_delete on public.organisation_members for delete to authenticated using (
  public.is_admin()
  or exists (select 1 from public.organisations o where o.id = organisation_id and o.created_by = auth.uid()));

-- Assessments
create policy assessments_select on public.assessments for select to authenticated
  using (public.can_access_assessment(id));
create policy assessments_insert on public.assessments for insert to authenticated
  with check (owner_id = auth.uid());
create policy assessments_update on public.assessments for update to authenticated
  using (public.can_access_assessment(id)) with check (public.can_access_assessment(id));
create policy assessments_delete on public.assessments for delete to authenticated
  using (owner_id = auth.uid() or public.is_admin());

-- Child tables gated by assessment access
create policy ash_all on public.assessment_status_history for all to authenticated
  using (public.can_access_assessment(assessment_id)) with check (public.can_access_assessment(assessment_id));
create policy aisp_all on public.ai_system_profiles for all to authenticated
  using (public.can_access_assessment(assessment_id)) with check (public.can_access_assessment(assessment_id));
create policy qr_all on public.questionnaire_responses for all to authenticated
  using (public.can_access_assessment(assessment_id)) with check (public.can_access_assessment(assessment_id));
create policy rc_all on public.risk_classifications for all to authenticated
  using (public.can_access_assessment(assessment_id)) with check (public.can_access_assessment(assessment_id));
create policy evidence_all on public.evidence_log_entries for all to authenticated
  using (public.can_access_assessment(assessment_id)) with check (public.can_access_assessment(assessment_id));
create policy docs_all on public.generated_documents for all to authenticated
  using (public.can_access_assessment(assessment_id)) with check (public.can_access_assessment(assessment_id));

-- Reference content: read-all (authenticated), admin-write
create policy frameworks_select on public.legal_frameworks for select to authenticated using (true);
create policy frameworks_write on public.legal_frameworks for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy refs_select on public.legal_references for select to authenticated using (true);
create policy refs_write on public.legal_references for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy samples_select on public.sample_systems for select to authenticated using (true);
create policy samples_write on public.sample_systems for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Audit logs
create policy admin_changes_select on public.admin_content_changes for select to authenticated
  using (public.is_admin());
create policy admin_changes_insert on public.admin_content_changes for insert to authenticated
  with check (public.is_admin());
create policy activity_select on public.activity_log for select to authenticated
  using (public.is_admin() or actor_id = auth.uid());
create policy activity_insert on public.activity_log for insert to authenticated
  with check (actor_id = auth.uid());
