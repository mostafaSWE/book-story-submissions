-- supabase/migrations/20261001000000_create_anta_contributions.sql
-- «أنت الكاتب» contributions (anta.readertowriter.net).
-- Additive only: creates new objects; does not alter public.submissions, public.set_updated_at,
-- storage buckets, or any existing grant. Safe to run twice.

create table if not exists public.anta_contributions (
  id                 bigint generated always as identity primary key,
  public_ref         uuid        not null default gen_random_uuid() unique,  -- safe id for emails/links
  ui_language        text        not null check (ui_language ~ '^[a-z]{2}$'),
  full_name          text        not null check (char_length(full_name) between 2 and 200),
  email              text        not null check (char_length(email) between 3 and 254),
  phone_e164         text        not null check (phone_e164 ~ '^\+[1-9][0-9]{6,14}$'),
  phone_region       text        check (phone_region ~ '^[A-Z]{2}$'),
  title              text        check (char_length(title) <= 600),          -- only if D3 = add title
  body               text        not null check (char_length(btrim(body)) > 0 and char_length(body) <= 8000),
  body_sha256        text        not null check (body_sha256 ~ '^[0-9a-f]{64}$'),
  consent_publish    boolean     not null,
  consent_version    text        not null,                                  -- which wording was shown
  status             text        not null default 'new'
                                 check (status in ('new', 'shortlisted', 'selected')),
  status_changed_at  timestamptz,
  admin_note         text,
  ip_hash            text,                                                  -- HMAC(ip, secret), never the raw IP
  request_country    text        check (request_country ~ '^[A-Z]{2}$'),    -- Cloudflare CF-IPCountry
  user_agent         text        check (char_length(user_agent) <= 400),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create unique index if not exists anta_contributions_email_body_uq on public.anta_contributions (lower(email), body_sha256);
create index if not exists anta_contributions_created_idx on public.anta_contributions (created_at desc);
create index if not exists anta_contributions_status_idx  on public.anta_contributions (status, created_at desc);
create index if not exists anta_contributions_email_idx   on public.anta_contributions (lower(email));
create index if not exists anta_contributions_phone_idx   on public.anta_contributions (phone_e164);

create or replace function public.anta_contributions_touch()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  if new.status is distinct from old.status then new.status_changed_at := now(); end if;
  return new;
end $$;

drop trigger if exists anta_contributions_touch on public.anta_contributions;
create trigger anta_contributions_touch before update on public.anta_contributions
  for each row execute function public.anta_contributions_touch();

alter table public.anta_contributions enable row level security;          -- no policies: service role only
revoke all on table public.anta_contributions from anon, authenticated;
revoke all on function public.anta_contributions_touch() from public, anon, authenticated;

comment on table public.anta_contributions is
  'Reader contributions for «أنت الكاتب» (anta.readertowriter.net). Separate from public.submissions.';

-- Rollback (touches only the objects above):
--   drop table if exists public.anta_contributions;
--   drop function if exists public.anta_contributions_touch();
