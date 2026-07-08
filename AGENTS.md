# Agent Guide

This repository is shared by Codex, Claude, and future AI agents. Start here before scanning the whole codebase.

## Read Order

1. `AGENTS.md`
2. `docs/ai/PROJECT_STATE.md`
3. `docs/ai/NEXT_ACTIONS.md`
4. `docs/ai/DECISION_LOG.md`
5. `docs/ai/SOURCE_INDEX.md`
6. If backend or Supabase is involved, also read:
   - `docs/architecture/BACKEND_SYNC_STRATEGY.md`
   - `docs/ai/SUPABASE_SETUP.md`

## Project Snapshot

- Name: Sohbetlik
- Repo: `https://github.com/enesgarip/sohbetlik`
- Production: `https://sohbetlik.vercel.app`
- Product: two-person, AI-assisted conversation PWA for dates.
- Principle: no scoring, no compatibility percentage, no "suitable / unsuitable" judgment.
- Current frontend: Vite + React + TypeScript.
- Current live flow: Supabase-backed production room, invite, answer, waiting, and results flow, with localStorage fallback when Supabase env vars are absent.
- Primary backend: Supabase Auth anonymous users + Postgres + Realtime.
- Fallback backend direction: Upstash Redis only if Supabase becomes blocked again.

## Agent Working Protocol

- Do not rescan everything by default. Read the files listed above first.
- Use `rg` / `rg --files` before slower search tools.
- Keep changes scoped to the task.
- Never commit secrets or service-role keys.
- Never expose server-only secrets via `VITE_`.
- For Supabase work, verify current Supabase docs/changelog before changing schema/auth/realtime code.
- For frontend work, run at least `npm run lint`, `npm run build`, and relevant tests.
- For meaningful changes, update:
  - `docs/ai/PROJECT_STATE.md` if project status changed.
  - `docs/ai/NEXT_ACTIONS.md` if priorities changed.
  - `docs/ai/WORK_LOG.md` with a short dated note.

## Current Test Commands

```bash
npm run lint
npm run test:unit
npm run build
npm run test:e2e
```

Supabase local verification:

```bash
npm run db:start:local
npm run db:lint:local
npx supabase migration list --local
npm run db:stop:local
```

## Known Project Constraints

- The app should feel like a conversation helper, not a test.
- Results must invite conversation and avoid judgment.
- MVP should stay free-tier friendly.
- Real two-device production sync is live and verified on `https://sohbetlik.vercel.app`; AI summary generation is the next technical milestone.
