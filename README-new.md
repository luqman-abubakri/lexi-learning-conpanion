# Lexi

## Environment variables

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Vapi
NEXT_PUBLIC_VAPI_PUBLIC_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY` is required for server actions. Keep it server-only — never expose it as `NEXT_PUBLIC_`.

## Database setup

Run migrations in order from `supabase/migrations/`:

1. `001_create_voice_conversations.sql`
2. `002_create_companions.sql`
3. `003_rls_policies.sql`

You can apply them from the Supabase SQL editor or with the Supabase CLI:

```bash
supabase db push
```

## Architecture

- **Auth:** Clerk protects all routes via `proxy.ts`.
- **Database:** Supabase Postgres accessed only from Server Actions using the service role client (`lib/admin.ts`) after Clerk ownership checks.
- **Companions:** Full CRUD with public/private visibility, search, filter, and sort.
- **Voice:** Vapi Web SDK via `hooks/useVapi.ts` and `hooks/useVoiceSession.ts`. Transcripts persist to `voice_conversations` on call end.
- **Journey:** `/my-journey` lists saved voice sessions and transcripts.

## Vapi notes

- Client-side calls use `NEXT_PUBLIC_VAPI_PUBLIC_KEY` and ephemeral assistant config derived from each companion record.
- Microphone permissions are required to start a call.
- Optional future enhancement: `VAPI_PRIVATE_KEY` and webhook route for server-managed assistants.

## Testing checklist

- Sign in / sign up / sign out
- Create companion from `/companions/new`
- Companion appears on home and `/companions`
- Launch voice session from companion detail page
- End call saves transcript to My Journey
- Public companions visible to all signed-in users; private companions only to owner
- Search, filter, and sort on `/companions`
