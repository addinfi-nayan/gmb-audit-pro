# GMB Audit Pro — Setup From Scratch

This project is a Next.js app. Everything that used to run through n8n webhooks now
runs as native code in `app/api/*`. See **"What happened to the n8n files"** at the
bottom for the full mapping.

Architecture at a glance:
- **Search** → Google Places API (New), called directly from `app/api/search-places`.
- **AI audit** → Anthropic API (`claude-opus-5`), called directly from `app/api/analyze-gmb`.
- **Auth + report storage** → Supabase (Google OAuth + Postgres with Row Level Security).
- **Email** → Resend (preferred) or Gmail/SMTP via Nodemailer, from `app/api/send-email`.
- **Payments** → Razorpay, unchanged from the original app.
- **Lead/search logging + Admin Panel (CMS)** → Supabase tables (`leads`, `search_logs`,
  `coupons`, `profiles`), managed from `/admin` — no external spreadsheet or CMS needed.

All secrets live in `.env.local` (gitignored). `.env.example` documents every variable
with no real values — safe to commit.

---

## Status legend
Check `.env.local` at any time to see exactly what's filled in vs. blank — that file is
the single source of truth, this doc is just the walkthrough for filling it in.

---

## Phase 1 — Google Cloud project + Places API

1. **console.cloud.google.com** → create a project (e.g. "gmb-audit-pro").
2. **APIs & Services → Library** → enable **Places API (New)**.
3. **APIs & Services → Credentials → Create Credentials → API key.**
4. Restrict it: API restrictions → "Places API (New)" only.
5. Copy the key → `.env.local` → `GOOGLE_PLACES_API_KEY`.

Note: enabling Places API requires a billing account (card) on the Google Cloud
project, but Google gives a $200/month Maps Platform credit — a small app like this
shouldn't exceed it. No credit card is needed for Phase 3 (Supabase Google OAuth)
below.

## Phase 2 — Anthropic API key

1. **console.anthropic.com** → sign in (Google sign-in works) → **Settings → Billing**
   → add a payment method or buy prepaid credits (pay-as-you-go, no subscription).
2. **API Keys → Create Key** → copy it → `.env.local` → `ANTHROPIC_API_KEY`.
3. `ANTHROPIC_MODEL` is already defaulted to `claude-opus-5` — leave as is unless told
   otherwise.

## Phase 3 — Supabase (auth + report storage)

This is the backbone: it replaces what used to be NextAuth, and it's where each
user's saved audit reports live.

1. **supabase.com** → sign up → **New Project** (name, region, DB password — save
   the password somewhere).
2. **Project Settings → API** → copy **Project URL** and **anon/public key** →
   `.env.local` → `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. **SQL Editor → New query** → paste the entire contents of `supabase/schema.sql`
   from this repo → **Run**. This creates `reports` (each user's saved audits),
   `profiles` (premium status), `premium_allowlist`, `leads`, `search_logs`, and
   `coupons` — all with Row Level Security. The whole file is safe to re-run any
   time it changes (every statement is idempotent), so if you ran an earlier
   version of it, just re-run the current one.
4. **Authentication → Providers → Google** → toggle on. It needs a Google OAuth
   Client ID/Secret:
   - In **Google Cloud Console** (same project as Phase 1) → **APIs & Services →
     Credentials → Create Credentials → OAuth client ID** → type **Web application**.
   - This Supabase screen shows an exact **Authorized redirect URI**
     (`https://<your-project-ref>.supabase.co/auth/v1/callback`) — add that in the
     Google Cloud OAuth client's "Authorized redirect URIs".
   - Copy the Client ID + Secret from Google Cloud into Supabase's Google provider
     fields → **Save**.
5. **Authentication → URL Configuration** → Site URL = `http://localhost:3000`, and
   add `http://localhost:3000/**` to Redirect URLs. (Update both to your real domain
   later when you deploy.)

## Phase 4 — Email (Resend, recommended)

1. **resend.com** → sign up.
2. **API Keys → Create API Key** → copy it (starts with `re_`) → `.env.local` →
   `RESEND_API_KEY`.
3. Leave `RESEND_FROM_EMAIL` blank for now — it defaults to `onboarding@resend.dev`,
   which can only deliver to the email address you signed up to Resend with until you
   verify a domain. Fine for testing.
4. When ready for real users: Resend → **Domains → Add Domain**, add the DNS records
   at your registrar, wait for verification, then set
   `RESEND_FROM_EMAIL=WhatMyRank <reports@yourdomain.com>`.

*(Alternative, not required if Resend is set up: Gmail App Password or generic SMTP —
see the commented options in `.env.example`. The app tries Resend first, then Gmail,
then SMTP, automatically.)*

## Phase 5 — Razorpay (payment to unlock the report)

1. **dashboard.razorpay.com** → sign up.
2. Stay in **Test Mode** (toggle top-left) → **Settings → API Keys → Generate Test Key**.
3. Copy Key ID + Key Secret → `.env.local` → `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`.
4. `RAZORPAY_PRICE_AMOUNT` is already `499` — adjust if you want a different unlock price.
5. Switch to live keys only when ready to accept real payments.

## Phase 6 — Admin Panel (`/admin`)

The built-in CMS/admin panel replaces what used to be a Google Sheet: it lists every
signed-up user (with a Premium/Guest badge and a "Make Premium" button), every
captured lead, every search log, and lets you create/toggle/delete coupon codes —
all backed by the Supabase tables from Phase 3, no spreadsheet needed.

1. **Supabase → Project Settings → API** → copy the **service_role** key (this is
   secret — it bypasses Row Level Security) → `.env.local` → `SUPABASE_SERVICE_ROLE_KEY`.
2. `.env.local` → `ADMIN_EMAILS` → comma-separated list of the Google account
   email(s) allowed into `/admin` (e.g. `you@gmail.com`). This must be an email you
   can actually sign in with via Google.
3. Run the app, sign in with an allowlisted email, open the user menu (top-right
   avatar) → **Admin Panel**, or go straight to `http://localhost:3000/admin`.

What you can do from there:
- **Users tab** — see everyone who's signed in, grant/revoke **Premium** by email
  (permanent free access — no payment needed on any future audit for that account;
  works even before that person has ever signed in).
- **Leads tab** — every email/phone captured at the paywall.
- **Search Logs tab** — every top search result logged.
- **Coupons tab** — add/deactivate/delete codes that fully skip payment (replaces
  the old hardcoded `"first20"` coupon).

## Phase 7 — Run and verify end-to-end

```bash
npm run dev
```

Open `http://localhost:3000` and walk through, in order:

1. **Search box** — type a business name → suggestions appear (Places).
2. **Sign in with Google** — redirects through Google, back to the app, avatar shows
   in the navbar (Supabase Auth).
3. **Run an audit** (search → competitors → analyze):
   - Report renders (Anthropic).
   - A row appears in Supabase → **Table Editor → reports**, tied to your user id.
   - A **themed summary email** should land in your inbox within seconds (this fires
     automatically the moment the report finishes — no click needed).
4. **Download PDF** — a **second email** arrives, same theme, PDF attached.
5. **Unlock/payment** — Razorpay test card `4111 1111 1111 1111`, any future
   expiry/CVV.
6. **Admin panel** — sign in with an `ADMIN_EMAILS` account → `/admin` → confirm your
   test user, lead, and search show up. Try "Make Premium" on your own account, then
   run another audit — the paywall/lead modal should be skipped entirely.

---

## What happened to the n8n files

The project originally had an `n8n workflow/` folder (`Analyser.json`,
`Searcher.json`, `inserted details.json`) plus `direct-n8n-test.js`, and the app
called out to a hosted n8n instance
(`n8n-pro-775604255858.asia-south1.run.app`) for three things. All three were ported
to native Next.js code and **the n8n folder and test script were deleted** — nothing
n8n-related remains in the repo or is called at runtime.

| n8n workflow | What it did | Replaced by |
|---|---|---|
| `Searcher.json` (webhook `search-gmb`) | Called Google Places API, logged the top result to a "GMB App Users" Google Sheet | `app/api/search-places/route.ts` — calls Google Places directly; logs to the Supabase `search_logs` table, viewable in `/admin` |
| `Analyser.json` (webhook `analyze-gmb`) | Called Claude via n8n's Anthropic node with a GMB-auditor prompt | `app/api/analyze-gmb/route.ts` — calls the Anthropic API directly with the same prompt, using `@anthropic-ai/sdk` |
| `inserted details.json` (webhook `save-lead`) | Appended captured lead email/phone to a Google Sheet | `app/api/save-lead/route.ts` — inserts into the Supabase `leads` table, viewable in `/admin` |
| *(no workflow file, webhook only)* `send-pdf-email` | Fallback path in the email route that POSTed to an n8n webhook | Removed entirely — replaced by Resend/Gmail/SMTP directly in `app/api/send-email/route.ts` |

The two workflows that used to write to Google Sheets never actually ran through
Sheets in this codebase for long — they write straight to Supabase (`leads` and
`search_logs` tables, both visible in `/admin`). There is no Google Sheets
integration anywhere in the project: no `googleapis` dependency, no
`lib/googleSheets.ts`, no `GOOGLE_SHEETS_*` env vars, no service account. If you
ever see any of those mentioned, it's stale and doesn't apply to the current code.

One follow-up worth doing: the old `Searcher.json`/`Analyser.json` files had a Google
Places API key hardcoded in plain text
(`AIzaSyC1f3LTP4k1EofggrOrjJQd2Rj-35BCQNM`). Those files are deleted now, but if that
key was ever committed to git history anywhere or shared outside this session, rotate
it in Google Cloud Console — don't reuse it as your `GOOGLE_PLACES_API_KEY` above.
