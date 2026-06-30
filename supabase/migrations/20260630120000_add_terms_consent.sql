-- Add Terms & Conditions consent to submissions.
-- Apply this in the Supabase SQL editor or with the Supabase CLI.
-- Idempotent: safe to run more than once.

alter table public.submissions
  add column if not exists accepted_terms boolean not null default false;

alter table public.submissions
  add column if not exists accepted_terms_at timestamptz;

comment on column public.submissions.accepted_terms is
  'Whether the participant accepted the Terms & Conditions at submission time.';
comment on column public.submissions.accepted_terms_at is
  'UTC timestamp when the participant accepted the Terms & Conditions.';
