# Voice system refactor TODO

## Step 1 — Controller singleton
- Create `lib/voice/voiceController.ts` (or similar) that owns the single Vapi instance.
- Add guarded event listener registration.
- Provide controller API: start/stop/subscribe/connect-state.

## Step 2 — Hook refactor (useVapi)
- Refactor `hooks/useVapi.ts` into a thin subscription wrapper around the controller.
- Ensure it never creates multiple Vapi instances.

## Step 3 — Automatic reconnection
- Implement exponential backoff reconnect (1,2,4,8,16s…)
- Add max retry count + reconnect spam prevention.

## Step 4 — Network/visibility + UI gating
- Detect offline/online and pause/resume reconnect.
- Update UI button disabled states during offline.

## Step 5 — Preserve session
- Add active session persistence (`voice_sessions` table via Supabase migration or alternative).
- Implement server actions:
  - create active voice session on start
  - update transcript + remaining time on disconnect/reconnect
  - fetch active session on reconnect
  - end active session on end

## Step 6 — useVoiceSession logic
- Preserve call duration (no reset on reconnect).
- Preserve transcript buffer across reconnect.
- On reconnect success, restore session from backend.

## Step 7 — Microphone recovery
- Add mic permission revoked handling and “Retry Microphone” UI.
- Handle device changes (best-effort) without crashing.

## Step 8 — UI updates
- Update `VoiceSessionPanel.tsx` to show required statuses:
  - 🟢 Connected
  - 🟡 Connecting...
  - 🟡 Reconnecting...
  - 🔴 Disconnected
  - 🔴 Connection Lost
  - ⚪ Ending Session
- Disable mic/start/send when connecting/offline.

## Step 9 — Cleanup + memory leak prevention
- Ensure controller clears timers and removes listeners.
- Ensure hooks unsubscribe properly.

## Step 10 — Testing
- Build + lint.
- Manual scenario checklist.

