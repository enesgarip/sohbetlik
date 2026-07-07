# Claude Handoff

You are working on Sohbetlik with the user and Codex. Do not start by scanning the full repo.

First read:

1. `AGENTS.md`
2. `docs/ai/PROJECT_STATE.md`
3. `docs/ai/NEXT_ACTIONS.md`
4. `docs/ai/DECISION_LOG.md`
5. `docs/ai/SOURCE_INDEX.md`

If the task touches Supabase, backend sync, auth, database schema, or realtime, also read:

1. `docs/architecture/BACKEND_SYNC_STRATEGY.md`
2. `docs/ai/SUPABASE_SETUP.md`
3. `supabase/migrations/20260707112731_initial_mvp_schema.sql`

## Communication

- The user prefers Turkish.
- Keep answers practical and concise.
- When implementing, make the change instead of only proposing it.
- Mention commands you ran and whether they passed.

## Non-Negotiables

- No compatibility scores.
- No judgmental relationship language.
- No service-role keys in frontend code.
- No secrets committed to git.
- Supabase tables exposed through Data API need RLS and explicit grants where required.
- Update `docs/ai/WORK_LOG.md` after meaningful work so Codex can continue without re-discovery.

## Useful Context

- Current production URL: `https://sohbetlik.vercel.app`
- GitHub repo: `https://github.com/enesgarip/sohbetlik`
- Current backend direction: Supabase first, Upstash only as fallback.
- The local app already has a room repository interface and localStorage implementation.
- The next big implementation is a Supabase-backed room repository and real two-device sync.
