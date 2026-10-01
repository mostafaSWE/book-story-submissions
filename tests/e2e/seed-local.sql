-- LOCAL TEST DATABASE ONLY (docker, tests/db in sites/anta). Never run against production.
-- Fake entries for both books so the shared admin can be tested end to end.
truncate public.submissions restart identity;
truncate public.anta_contributions restart identity;

insert into public.submissions (selected_language, full_name, phone_number, email, country, country_code, receipt_image, story_text, story_images, accepted_terms, accepted_terms_at, created_at)
values
  ('ar', 'TEST قارئة أولى', '+971 50 111 2222', 'reader1@example.com', 'الإمارات', 'AE', '{"bucket":"receipts","path":"local/r1.jpg","originalName":"r1.jpg"}', E'قصة قصيرة\nبسطرين', '[]', true, now() - interval '2 days', now() - interval '2 days'),
  ('en', 'TEST Second Reader', '0501112233', 'reader2@example.com', 'Saudi Arabia', 'SA', '{"bucket":"receipts","path":"local/r2.jpg","originalName":"r2.jpg"}', '=HYPERLINK("http://example.com","x")', '[]', true, now() - interval '10 days', now() - interval '10 days'),
  ('fr', 'TEST Troisième', '+33 6 12 34 56 78', 'reader3@example.com', 'France', 'FR', '{"bucket":"receipts","path":"local/r3.jpg","originalName":"r3.jpg"}', null, '[{"bucket":"story-pages","path":"local/p1.jpg","originalName":"p1.jpg"}]', false, null, now() - interval '1 hour');

insert into public.anta_contributions (ui_language, full_name, email, phone_e164, phone_region, title, body, body_sha256, consent_publish, consent_version, status, request_country, created_at)
values
  ('ar', 'TEST عبدُالله', 'test+a1@example.com', '+971501234567', 'AE', 'حكمة القلم', E'الكلمةُ الصادقةُ لا تشيخ\nسطرٌ ثانٍ 🌙', md5('a1') || md5('a1x'), true, '2026-10-01', 'new', 'AE', now() - interval '1 hour'),
  ('ar', 'TEST مريم', 'test+a2@example.com', '+966501234567', 'SA', null, 'من جدّ وجد', md5('a2') || md5('a2x'), true, '2026-10-01', 'shortlisted', 'SA', now() - interval '3 days'),
  ('en', 'TEST Layla', 'test+a3@example.com', '+447400123456', 'GB', 'On ink', 'A true sentence does not age.', md5('a3') || md5('a3x'), true, '2026-10-01', 'selected', 'GB', now() - interval '5 days'),
  ('ar', 'TEST سالم', 'test+a4@example.com', '+97433123456', 'QA', null, '-2+3 تبدأ بعلامة ناقص', md5('a4') || md5('a4x'), true, '2026-10-01', 'selected', null, now() - interval '20 days'),
  ('en', 'TEST Omar', 'test+a5@example.com', '+96550000000', 'KW', null, 'Silence is also an answer.', md5('a5') || md5('a5x'), true, '2026-10-01', 'new', 'KW', now() - interval '12 days'),
  ('ar', 'TEST نور', 'test+a6@example.com', '+97336001234', 'BH', 'سطر', 'الصبر مفتاح', md5('a6') || md5('a6x'), true, '2026-10-01', 'new', 'BH', now() - interval '6 days');

select 'submissions' t, count(*) from public.submissions union all select 'anta', count(*) from public.anta_contributions;
