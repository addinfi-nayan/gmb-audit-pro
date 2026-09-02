-- Migration 0001 — run in the Supabase SQL Editor AFTER supabase/schema.sql.
-- Adds percentage discount, usage limits, and expiry to coupons.
-- Safe to re-run — every statement is idempotent.

alter table public.coupons
  add column if not exists discount_percent integer not null default 100,
  add column if not exists max_uses integer,
  add column if not exists used_count integer not null default 0,
  add column if not exists expires_at timestamptz;

alter table public.coupons
  drop constraint if exists coupons_discount_percent_check;
alter table public.coupons
  add constraint coupons_discount_percent_check
  check (discount_percent > 0 and discount_percent <= 100);

alter table public.coupons
  drop constraint if exists coupons_max_uses_check;
alter table public.coupons
  add constraint coupons_max_uses_check
  check (max_uses is null or max_uses > 0);

-- Atomically checks a coupon is usable (active, not expired, uses remaining)
-- and increments used_count in one step — avoids a race between two people
-- redeeming the last remaining use at the same time.
create or replace function public.redeem_coupon(coupon_code text)
returns table (
  code text,
  discount_percent integer,
  redeemed boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_code text;
  updated_discount integer;
begin
  update public.coupons c
  set used_count = c.used_count + 1
  where c.code = lower(coupon_code)
    and c.active = true
    and (c.expires_at is null or c.expires_at > now())
    and (c.max_uses is null or c.used_count < c.max_uses)
  returning c.code, c.discount_percent into updated_code, updated_discount;

  if updated_code is not null then
    return query select updated_code, updated_discount, true;
  else
    return query select lower(coupon_code), null::integer, false;
  end if;
end;
$$;
