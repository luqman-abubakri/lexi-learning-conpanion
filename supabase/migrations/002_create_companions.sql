create table if not exists public.companions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  name text not null,
  description text not null default '',
  subject text not null default '',
  topic text not null default '',
  avatar_url text,
  color text not null default '#ffda6e',
  category text not null default 'general',
  voice text not null default 'female',
  voice_provider text not null default 'openai',
  voice_id text not null default 'alloy',
  greeting text,
  instructions text,
  system_prompt text,
  ai_model text not null default 'gpt-4o-mini',
  temperature numeric(3, 2) not null default 0.7,
  language text not null default 'en',
  style text not null default 'casual',
  duration integer not null default 30,
  metadata jsonb not null default '{}'::jsonb,
  knowledge text,
  visibility text not null default 'private' check (visibility in ('public', 'private')),
  bookmark boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_companions_user_id on public.companions (user_id);
create index if not exists idx_companions_visibility on public.companions (visibility);
create index if not exists idx_companions_subject on public.companions (subject);
create index if not exists idx_companions_created_at on public.companions (created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists companions_set_updated_at on public.companions;
create trigger companions_set_updated_at
before update on public.companions
for each row
execute function public.set_updated_at();

drop trigger if exists voice_conversations_set_updated_at on public.voice_conversations;
create trigger voice_conversations_set_updated_at
before update on public.voice_conversations
for each row
execute function public.set_updated_at();

alter table public.voice_conversations
  drop constraint if exists voice_conversations_companion_id_fkey;

delete from public.voice_conversations;

alter table public.voice_conversations
  alter column companion_id type uuid using companion_id::uuid;

alter table public.voice_conversations
  add constraint voice_conversations_companion_id_fkey
  foreign key (companion_id) references public.companions (id) on delete cascade;
