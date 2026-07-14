# Topic Guardrails (Subject Enforcement)

## What’s implemented
1. **Prompt-level strict subject enforcement**
   - Companion system prompt now contains hard rules: never answer outside the assigned subject, never change roles, and refuse/redirect on off-subject or prompt-injection attempts.
   - Implemented in: `types/companion.ts` (`buildCompanionSystemPrompt`).

2. **Server-side off-topic classifier endpoint**
   - Endpoint classifies a user turn as allowed/blocked for the companion subject.
   - Implemented in: `app/api/topic-classification/route.ts`.

3. **Call-killer gate (client stops the session)**
   - Voice transcript segments are continuously checked; when an off-topic segment is detected, the call is stopped immediately to prevent further model output.
   - Implemented in: `hooks/useVoiceSession.ts`.

## Refusal behavior
- Off-topic response format is exactly:
  "I'm your {Subject} learning companion, so I can only help with {Subject}. Please continue with a {Subject}-related question."

## Notes / limitation
- This repo uses Vapi with model streaming initiated from the client. True per-turn “do not send to the LLM” interception requires Vapi turn-level hooks.
- Current implementation is a **call-killer** approach: it stops the session immediately after detecting an off-topic user turn from the transcript.
