# TODO - Lexi Learning Companion

## Phase 1 (safe, non-breaking)
- [ ] Recent Completed Sessions overflow: make list container fixed-height + scroll with emerald scrollbar (`app/components/CompanionList.tsx`).

- [ ] Companion delete UI+server enforcement:
  - [ ] Audit Supabase schema/tables for companion-related records (sessions, completed lessons, assets, vapi mappings).
  - [ ] Extend `app/libs/actions/companions.ts` deleteCompanion to delete related records safely (ownership enforced server-side + RLS).
  - [ ] Add Delete button/menu + confirmation modal.
  - [ ] Optimistic UI removal + success/error toasts + redirect if needed.

- [ ] Voice reconnect improvements (minimal, non-breaking)
  - [ ] Update `hooks/useVapi.ts` to add reconnect with exponential backoff and prevent duplicate Vapi instances/listeners.
  - [ ] Update `app/components/VoiceSessionPanel.tsx` connection status badges and disable mic while reconnecting.

## Phase 2 (most important security/logic)
- [ ] Strict subject lock: semantic classification + server-side validation + system prompt update.
- [ ] Session time limit enforcement (server as source of truth) and terminate voice + stop AI + UI disable on expiration.
- [ ] Security audit of every API route/action for ownership/authorization.

## Final verification
- [ ] Build for production; ensure no TS/ESLint errors.
- [ ] Re-check all checklist items from the prompt.

