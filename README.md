# BiasLens — Working Platform

**Algorithmic bias testing and accountability platform for BeAccessible.**
Built to the *BiasLens Working Platform Build Brief v1.0*. This repository is the
**MVP Working Platform** milestone (Brief Section 24): authentication,
organisation/role setup, dashboard, My Assessments, the accessible layout shell,
and BeAccessible branding — built on the brief's production stack and a real,
live database. Later sprints add the questionnaire, risk engine, fairness
calculator, compliance mapper, request generator and AIA/FRIA builder.

---

## Tech stack (per Brief Section 3)

| Layer | Tool |
|---|---|
| App framework | Next.js 15 (App Router) + TypeScript |
| UI | Custom accessible component system + CSS design tokens (BeAccessible brand) |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth (email/password, magic link, password reset) |
| Authorisation | Supabase Row Level Security + app-level role checks |
| Hosting | Vercel (recommended) |

> The brief also lists Prisma as an option. This build uses Supabase SQL
> migrations directly (already applied to the live database). Prisma can be
> layered on later without schema changes.

---

## Live backend (already provisioned)

A Supabase project is **already created and configured** in the **BeAccessible**
organisation:

- **Project:** Beaccessible
- **Region:** eu-west-2 (London) — close to both EU and SA users
- **API URL:** `https://uuvxqyrqhqktkeovkivx.supabase.co`
- **Database:** schema, row-level security, seed legal frameworks and 5 demo
  systems are all loaded (see `supabase/schema.sql`).

The publishable (anon) key is safe to expose in the browser — all data is
protected by Row Level Security.

---

## Environment variables

Copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://uuvxqyrqhqktkeovkivx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable key from Supabase -> Project Settings -> API>
NEXT_PUBLIC_SITE_URL=https://your-live-domain   # http://localhost:3000 for local dev
```

`NEXT_PUBLIC_SITE_URL` is used to build auth email redirect links, so set it to
your real domain in production.

---

## Run locally (for a developer)

```bash
npm install
npm run dev      # http://localhost:3000
```

Build for production:

```bash
npm run build
npm start
```

---

## Deploy live (Vercel — no terminal needed)

1. Put this folder in a Git repository (GitHub, GitLab or Bitbucket).
2. Go to **vercel.com**, sign in, **Add New… → Project**, and import the repo.
3. In the project's **Environment Variables**, add the three variables above.
4. Click **Deploy**. Vercel installs and builds in the cloud.
5. In **Supabase → Authentication → URL Configuration**, set the **Site URL** and
   add `https://<your-vercel-domain>/auth/callback` to **Redirect URLs**.

---

## What works in this milestone

- Sign up, email confirmation, sign in, magic-link sign in, password reset, sign out.
- A profile row is created automatically on sign-up (database trigger).
- Role-based onboarding (4 roles); role can be changed in Account Settings.
- Role-adaptive dashboard (guidance and next steps change per role).
- My Assessments: create, open, edit system basics, change status, delete — all
  persisted to the database.
- Accessible app shell: skip link, landmarks, keyboard navigation, visible focus,
  collapsible navigation, status shown with text + symbols (never colour alone).
- Accessibility Statement and Privacy Notice pages.
- Activity log records sensitive actions (create/delete, role changes, onboarding).

## Security & privacy

- Row Level Security on every table; users only see their own data (and admins
  see all). Helper functions `is_admin()` and `can_access_assessment()` enforce
  access.
- Security headers set in `next.config.mjs`.
- Audit logging in `activity_log`; admin content edits captured in
  `admin_content_changes`.

## Accessibility

Targets WCAG 2.2 AAA where feasible, WCAG 2.1 AA as the minimum gate, with
Universal Design throughout. See the in-app Accessibility Statement.

---

## Project structure

```
src/
  app/
    layout.tsx, page.tsx, globals.css
    login/  signup/  reset-password/  onboarding/  auth/callback/
    (app)/                      # authenticated area (shared shell)
      layout.tsx
      dashboard/  assessments/  settings/
      accessibility-statement/  privacy/
  components/   Sidebar, Topbar, Logo, StatusBadge
  lib/
    supabase/   client, server, middleware
    actions/    auth, profile, assessments
    roles.ts    i18n/
middleware.ts
supabase/schema.sql            # full database definition (reproducible)
```

---

Contact: hello@beaccessible.co.za
