# Claude Bootstrap Prompt

Use this if Claude is not running directly inside the repo and cannot auto-read `CLAUDE.md`.

```text
We are working on the Sohbetlik repo.

Before giving advice, treat these files as the project memory and ask me to provide any missing one:

1. AGENTS.md
2. CLAUDE.md
3. docs/ai/PROJECT_STATE.md
4. docs/ai/NEXT_ACTIONS.md
5. docs/ai/DECISION_LOG.md
6. docs/architecture/BACKEND_SYNC_STRATEGY.md
7. docs/ai/SUPABASE_SETUP.md

Important context:

- Product: Sohbetlik, a two-person AI-supported conversation PWA for dates.
- It is not a compatibility test.
- Do not produce scores, percentages, red flags, or suitable/unsuitable language.
- Current live app uses localStorage through RoomRepository.
- Primary backend direction is now Supabase because a free slot is available.
- Next implementation target is Supabase anonymous auth + Postgres + Realtime.
- Keep OpenAI keys server-side only.
- Never expose service_role keys in frontend code.
- Use Turkish with me unless code/docs require English.

When you finish meaningful work, tell me exactly which project memory files should be updated so Codex can continue without rescanning.
```
