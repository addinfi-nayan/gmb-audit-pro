-- Migration 0003 — run in the Supabase SQL Editor AFTER 0001 and 0002.
-- Records every successfully verified Razorpay payment so the admin dashboard
-- can report real revenue instead of guessing from coupon usage.
-- Safe to re-run — every statement is idempotent.

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  user_email text,
  gmb_name text,
  amount integer not null, -- whole rupees actually charged (post-discount)
  currency text not null default 'INR',
  coupon_code text,
  razorpay_order_id text not null,
  razorpay_payment_id text not null unique,
  created_at timestamptz not null default now()
);

create index if not exists payments_created_at_idx
  on public.payments (created_at desc);

create index if not exists payments_coupon_code_idx
  on public.payments (coupon_code);

alter table public.payments enable row level security;
-- No policies — only the service role (verify-payment route + admin API) can access this table.
