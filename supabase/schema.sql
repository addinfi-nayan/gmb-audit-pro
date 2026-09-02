-- Run this once in the Supabase SQL Editor (Project → SQL Editor → New query).
-- Stores each user's saved GMB audit reports, scoped to their own Supabase auth account.

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  gmb_name text,
  report_data jsonb not null,
  my_business jsonb,
  pdf_image_data text,
  created_at timestamptz not null default now()
);

create index if not exists reports_user_id_created_at_idx
  on public.reports (user_id, created_at desc);

alter table public.reports enable row level security;

drop policy if exists "Users can view their own reports" on public.reports;
create policy "Users can view their own reports"
  on public.reports for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own reports" on public.reports;
create policy "Users can insert their own reports"
  on public.reports for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own reports" on public.reports;
create policy "Users can update their own reports"
  on public.reports for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete their own reports" on public.reports;
create policy "Users can delete their own reports"
  on public.reports for delete
  using (auth.uid() = user_id);

-- =====================================================================
-- Admin panel: profiles (premium status), premium pre-allowlist, leads,
-- search logs, and coupons. Safe to re-run — every statement is idempotent.
-- =====================================================================

-- One row per signed-up user; created automatically by the trigger below.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  is_premium boolean not null default false,
  premium_granted_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- No insert/update/delete policies for regular users — profiles are written
-- only by the trigger (as the table owner) and by admin API routes (service role,
-- which bypasses RLS entirely).

-- Lets an admin grant premium to an email BEFORE that person ever signs in.
-- The signup trigger checks this table and marks the new profile premium if listed.
create table if not exists public.premium_allowlist (
  email text primary key,
  added_at timestamptz not null default now()
);

alter table public.premium_allowlist enable row level security;
-- No policies at all — regular users get zero access; only the service role
-- (admin API routes) and the trigger (as table owner) can touch this table.

-- Creates a profile row for every new auth user, marking them premium
-- immediately if their email was pre-approved via premium_allowlist.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, is_premium, premium_granted_at)
  values (
    new.id,
    new.email,
    exists (select 1 from public.premium_allowlist where email = new.email),
    case when exists (select 1 from public.premium_allowlist where email = new.email)
      then now() else null end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for any user who signed in before this migration ran.
insert into public.profiles (id, email, is_premium)
select u.id, u.email, exists (select 1 from public.premium_allowlist where email = u.email)
from auth.users u
on conflict (id) do nothing;

-- Captures the lead-gate form (email/phone/business) — replaces the old Google Sheet.
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  business text,
  email text,
  phone text,
  coupon text,
  created_at timestamptz not null default now()
);

alter table public.leads enable row level security;
-- No policies — only the service role (admin API + /api/save-lead) can access this table.

-- Captures top search results — replaces the old "GMB App Users" Google Sheet.
create table if not exists public.search_logs (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text,
  website text,
  created_at timestamptz not null default now()
);

alter table public.search_logs enable row level security;
-- No policies — service role only.

-- Coupon codes that fully skip payment (replaces the single hardcoded "first20").
create table if not exists public.coupons (
  code text primary key,
  active boolean not null default true,
  note text,
  created_at timestamptz not null default now()
);

alter table public.coupons enable row level security;
-- No policies — coupon validity is checked server-side via /api/validate-coupon
-- (service role), never queried directly from the browser.

insert into public.coupons (code, note)
values ('first20', 'Migrated from the old hardcoded coupon')
on conflict (code) do nothing;
