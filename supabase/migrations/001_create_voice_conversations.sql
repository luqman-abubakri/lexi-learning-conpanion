create table if not exists public.voice_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  companion_id text not null,
  transcript text not null default '',
  duration integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_voice_conversations_user_id on public.voice_conversations (user_id);
create index if not exists idx_voice_conversations_companion_id on public.voice_conversations (companion_id);
