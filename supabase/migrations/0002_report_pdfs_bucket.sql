-- Migration 0002 — run in the Supabase SQL Editor AFTER 0001_coupon_limits.sql.
-- Public storage bucket for generated report PDFs, so the email can link to a
-- downloadable file instead of attaching it. Uploads happen server-side only
-- (service role, via /api/upload-report-pdf) — no public write policy needed;
-- reads are public because the bucket itself is public and paths are
-- unguessable (report UUID or a random UUID).
-- Safe to re-run — idempotent.

insert into storage.buckets (id, name, public)
values ('report-pdfs', 'report-pdfs', true)
on conflict (id) do nothing;
