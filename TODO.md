# TODO

## Subject enforcement (Math/English/Biology etc.)
- [ ] Audit + identify where subject prompt is built and where voice user turns are handled.
- [ ] Rewrite system prompt in `types/companion.ts` to strictly refuse off-subject/role-change requests.
  - [x] (to be done next)

- [x] Add semantic-ish topic classifier (server-side) for user turns.

- [ ] Implement strict server-side validation gate by preventing off-topic turns from reaching the model.
  - [x] Call-killer flow: detect off-topic user transcripts and immediately stop the Vapi call and replace with a predefined refusal message.

- [x] Wire the gate into the voice transcript handling loop.

- [x] Ensure refusal response is <= 3 sentences and never partially answers.

- [ ] Add prompt-injection regression tests (unit tests for classifier + gate).
- [ ] Run `npm run lint` and `npm run build`.
- [ ] Manual test scenarios: Math/English examples from prompt.

