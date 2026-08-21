-- BiasLens security hardening upgrade
-- Prepared: 2026-08-21
--
-- Purpose:
-- 1. Remove the unused public.account_overview view that exposes auth.users
--    through a security-definer view.
-- 2. Harden public.is_biaslens_invited() by fixing its search_path and
--    narrowing execution privileges to authenticated users only.
--
-- This migration is intentionally narrow. It does not alter ADF or Voice of
-- Disability objects in the shared Supabase project.

begin;

-- Repository inspection found no BiasLens application call site for
-- public.account_overview and no admin/account page that depends on it.
-- Removing the unused view closes the auth.users exposure path completely.
drop view if exists public.account_overview;

-- The invitation helper is used by BiasLens RLS policies and must remain
-- available to authenticated users. Its referenced table is already schema
-- qualified; an empty search_path prevents privileged name-resolution drift.
alter function if exists public.is_biaslens_invited() set search_path = '';

revoke execute on function public.is_biaslens_invited() from public;
revoke execute on function public.is_biaslens_invited() from anon;
grant execute on function public.is_biaslens_invited() to authenticated;

commit;
