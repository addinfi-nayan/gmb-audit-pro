-- Migration 0004 — run in the Supabase SQL Editor AFTER 0003_payments.sql.
-- Explicitly raises the report-pdfs bucket's max object size. Without this, a
-- bucket falls back to the project's default Storage limit, which can be lower
-- than a full-report PDF — this was causing "The object exceeded the maximum
-- allowed size" upload failures. 25MB comfortably covers a long report even
-- after the JPEG-compression fix, and stays under common email attachment caps.
-- Safe to re-run — idempotent.

update storage.buckets
set file_size_limit = 26214400 -- 25 MB, in bytes
where id = 'report-pdfs';
