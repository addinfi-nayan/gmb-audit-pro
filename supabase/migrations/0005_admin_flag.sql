-- Migration 0005 — run in the Supabase SQL Editor AFTER 0004_report_pdfs_size_limit.sql.
-- Adds a database-backed admin flag so admin access can be granted from the admin
-- panel itself, instead of only via the ADMIN_EMAILS env var (which still works
-- as a permanent bootstrap allowlist — this column is additive, not a replacement).
-- Safe to re-run — idempotent.

alter table public.profiles
  add column if not exists is_admin boolean not null default false;
