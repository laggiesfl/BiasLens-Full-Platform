# BiasLens — how to put it live (for whoever helps Fadila)

**Plain summary for Fadila:** the whole platform is built and finished in this
folder, and its database is already live. The only remaining step is putting the
website online. This page tells a helper exactly how — it takes about 10 minutes
and is **free** (Vercel's free tier). You don't need to read the technical parts.

---

## Pre-flight check (done for you — July 2026)

These were reviewed and are ready, so the deploy should go smoothly:

- **No build-blockers.** The project is configured so a small type or lint
  warning cannot stop the cloud build.
- **Secrets are safe.** Your `.env.local` (with keys) and `node_modules` are
  excluded from Git, so nothing private gets published. You still paste the
  three environment variables into Vercel (Step 5 below).
- **Security headers** (clickjacking, content-type, referrer, permissions) are
  switched on.
- **Sign-in protection** (Supabase auth middleware) is wired across the app.

**The one thing only you can do:** signing in to GitHub and Vercel with your own
account. Nobody can do that part for you — follow the numbered steps below (or
hand this page to a helper).

---

## Already live? Publishing updates (the usual case now)

If the site is already online (it was first deployed to
`https://bias-lens-full-platform.vercel.app`), you do **not** repeat the full
setup below. New changes reach the live site like this:

1. Open **GitHub Desktop** and select the `BiasLens-Full-Platform` repository.
2. You'll see the changed files listed on the left. Type a short summary in the
   box (e.g. "Accessibility AAA fixes, report exports, tests") and click
   **Commit to main**.
3. Click **Push origin** (top right).
4. Vercel notices the push and rebuilds automatically (~2 minutes). Refresh the
   live link to see the changes.

That's the whole update loop. The first-time setup steps below are only needed if
you are deploying somewhere new.

---

## What this is

BiasLens — an algorithmic bias testing and accountability platform (Next.js 15 +
Supabase). Built to the *BiasLens Working Platform Build Brief*. The database,
security, and demo data are already set up on Supabase. This repository just
needs to be deployed.

## The database is already live (no setup needed)

- Supabase project is provisioned and ready (organisation: BeAccessible).
- Use these environment variables when deploying:

```
NEXT_PUBLIC_SUPABASE_URL=https://uuvxqyrqhqktkeovkivx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_B9aFyfK496rI7gw2reMdLg_E44OksPK
NEXT_PUBLIC_SITE_URL=https://<the-live-domain-vercel-gives-you>
```

(The anon key is safe to expose in the browser — all data is protected by
Supabase Row Level Security.)

## Fastest free deploy — Vercel (about 10 minutes)

**Option A — easiest for a non-developer (GitHub Desktop, no command line):**
1. Install **GitHub Desktop** (desktop.github.com) and sign in (free).
2. File → **Add local repository** → choose this folder
   (`BiasLens Full Platform`). If it warns it isn't a repository, click
   **"create a repository"**. (If it complains about an existing broken `.git`
   folder, turn on "show hidden files" in this folder, delete the `.git` folder,
   then try again.)
3. Click **Publish repository** (you can keep it private).
4. Go to **vercel.com**, sign in **with GitHub** (free), click
   **Add New → Project**, and import the `biaslens` repo.
5. In the project's **Environment Variables**, paste the three variables above.
6. Click **Deploy**. Vercel installs and builds it in the cloud (~2 min) and
   gives you a public link like `https://biaslens.vercel.app`.

**Option B — for a developer (command line):**
```bash
# from inside this folder
npm install
npx vercel        # follow prompts; add the 3 env vars when asked
npx vercel --prod # produces the public URL
```

## One final 30-second step after deploying

In **Supabase → Authentication → URL Configuration**:
- Set **Site URL** to the Vercel link.
- Add `https://<your-vercel-link>/auth/callback` to **Redirect URLs**.

This makes sign-up confirmation and password-reset emails work.

## That's it

Once deployed, the public link works in any browser (Firefox, Chrome, phones),
sign-up/login run against the live database, and the questionnaire, risk report
(with Word/PDF/CSV export) and evidence log all work.

Questions: hello@beaccessible.co.za
