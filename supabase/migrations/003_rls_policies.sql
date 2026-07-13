alter table public.companions enable row level security;
alter table public.voice_conversations enable row level security;

-- Companions: public read for public rows; owners manage their own rows.
create policy "companions_select_public"
  on public.companions
  for select
  to anon, authenticated
  using (visibility = 'public');

create policy "companions_select_own"
  on public.companions
  for select
  to anon, authenticated
  using (user_id = coalesce(auth.jwt() ->> 'sub', ''));

create policy "companions_insert_own"
  on public.companions
  for insert
  to anon, authenticated
  with check (user_id = coalesce(auth.jwt() ->> 'sub', ''));

create policy "companions_update_own"
  on public.companions
  for update
  to anon, authenticated
  using (user_id = coalesce(auth.jwt() ->> 'sub', ''))
  with check (user_id = coalesce(auth.jwt() ->> 'sub', ''));

create policy "companions_delete_own"
  on public.companions
  for delete
  to anon, authenticated
  using (user_id = coalesce(auth.jwt() ->> 'sub', ''));

-- Voice conversations: owners only.
create policy "voice_conversations_select_own"
  on public.voice_conversations
  for select
  to anon, authenticated
  using (user_id = coalesce(auth.jwt() ->> 'sub', ''));

create policy "voice_conversations_insert_own"
  on public.voice_conversations
  for insert
  to anon, authenticated
  with check (user_id = coalesce(auth.jwt() ->> 'sub', ''));

create policy "voice_conversations_update_own"
  on public.voice_conversations
  for update
  to anon, authenticated
  using (user_id = coalesce(auth.jwt() ->> 'sub', ''))
  with check (user_id = coalesce(auth.jwt() ->> 'sub', ''));

create policy "voice_conversations_delete_own"
  on public.voice_conversations
  for delete
  to anon, authenticated
  using (user_id = coalesce(auth.jwt() ->> 'sub', ''));

grant select, insert, update, delete on public.companions to anon, authenticated;
grant select, insert, update, delete on public.voice_conversations to anon, authenticated;
