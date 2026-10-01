-- Database checks for public.anta_contributions. Runs inside a transaction and rolls back,
-- so it leaves nothing behind. Any failed expectation raises an exception.
--   docker compose -f sites/anta/tests/db/docker-compose.yml exec -T db psql -U postgres -v ON_ERROR_STOP=1 -f /tests/db-checks.sql
begin;

do $$
declare
  ok_row  jsonb := jsonb_build_object(
    'ui_language','ar','full_name','TEST اختبار','email','test+db@example.com','phone_e164','+971501234567',
    'phone_region','AE','body','نصٌّ للاختبار','body_sha256', repeat('a',64),'consent_publish',true,'consent_version','v1');
  bad jsonb;
  cases jsonb := jsonb_build_array(
    jsonb_build_object('ui_language','arabic'),
    jsonb_build_object('full_name','x'),
    jsonb_build_object('phone_e164','0501234567'),
    jsonb_build_object('phone_e164','+97150123456789012'),
    jsonb_build_object('phone_region','ae'),
    jsonb_build_object('body','   '),
    jsonb_build_object('body', repeat('ب', 8001)),
    jsonb_build_object('body_sha256','not-a-hash'),
    jsonb_build_object('title', repeat('t', 601)),
    jsonb_build_object('request_country','T1'));
  rejected int := 0;
  r record;
  before_status timestamptz;
begin
  -- 1. RLS on, no grants for API roles
  if not (select relrowsecurity from pg_class where oid = 'public.anta_contributions'::regclass) then
    raise exception 'RLS is not enabled';
  end if;
  if has_table_privilege('anon', 'public.anta_contributions', 'select')
     or has_table_privilege('anon', 'public.anta_contributions', 'insert')
     or has_table_privilege('authenticated', 'public.anta_contributions', 'select')
     or has_table_privilege('authenticated', 'public.anta_contributions', 'insert') then
    raise exception 'anon/authenticated still have privileges on anta_contributions';
  end if;
  if has_function_privilege('anon', 'public.anta_contributions_touch()', 'execute') then
    raise exception 'anon can execute the trigger function';
  end if;

  -- 2. a valid row goes in; defaults are set
  insert into public.anta_contributions (ui_language, full_name, email, phone_e164, phone_region, body, body_sha256,
                                         consent_publish, consent_version)
  select ui_language, full_name, email, phone_e164, phone_region, body, body_sha256, consent_publish, consent_version
  from jsonb_populate_record(null::public.anta_contributions, ok_row)
  returning * into r;
  if r.status <> 'new' or r.public_ref is null or r.created_at is null or r.updated_at is null then
    raise exception 'defaults not applied: %', row_to_json(r);
  end if;

  -- 3. each bad field is rejected by a constraint
  for bad in select * from jsonb_array_elements(cases) loop
    begin
      insert into public.anta_contributions (ui_language, full_name, email, phone_e164, phone_region, body, body_sha256,
                                             consent_publish, consent_version, title, request_country)
      select coalesce(bad->>'ui_language', ok_row->>'ui_language'), coalesce(bad->>'full_name', ok_row->>'full_name'),
             'other+' || md5(bad::text) || '@example.com', coalesce(bad->>'phone_e164', ok_row->>'phone_e164'),
             coalesce(bad->>'phone_region', ok_row->>'phone_region'), coalesce(bad->>'body', ok_row->>'body'),
             coalesce(bad->>'body_sha256', md5(bad::text) || md5(bad::text)), true, 'v1', bad->>'title', bad->>'request_country';
      raise exception 'accepted a bad row: %', bad;
    exception when check_violation then rejected := rejected + 1;
    end;
  end loop;
  if rejected <> jsonb_array_length(cases) then raise exception 'only % of % bad rows rejected', rejected, jsonb_array_length(cases); end if;

  -- 4. same email (any case) + same body hash = duplicate
  begin
    insert into public.anta_contributions (ui_language, full_name, email, phone_e164, body, body_sha256, consent_publish, consent_version)
    values ('ar', 'TEST dup', 'TEST+DB@EXAMPLE.COM', '+971501234567', 'نص', repeat('a',64), true, 'v1');
    raise exception 'duplicate (email, body_sha256) was accepted';
  exception when unique_violation then null;
  end;

  -- 5. trigger: status change stamps status_changed_at, any update bumps updated_at
  before_status := r.status_changed_at;
  update public.anta_contributions set status = 'shortlisted' where id = r.id returning * into r;
  if r.status_changed_at is null or before_status is not null then raise exception 'status_changed_at not set'; end if;
  update public.anta_contributions set admin_note = 'note' where id = r.id returning * into r;
  if r.updated_at < r.created_at then raise exception 'updated_at not maintained'; end if;
  begin
    update public.anta_contributions set status = 'published' where id = r.id;
    raise exception 'invalid status accepted';
  exception when check_violation then null;
  end;

  -- 6. emoji / tashkeel stored byte-exact
  update public.anta_contributions set body = E'الحكمةُ 🌙✍🏽\nسطر ثانٍ' where id = r.id returning * into r;
  if r.body <> E'الحكمةُ 🌙✍🏽\nسطر ثانٍ' then raise exception 'text not stored exactly'; end if;

  raise notice 'ALL DB CHECKS PASSED (% bad rows rejected)', rejected;
end $$;

rollback;
