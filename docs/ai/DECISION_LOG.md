# Decision Log

Last updated: 2026-07-07

## Product Decisions

- Product name is `Sohbetlik`.
- The app is a conversation helper, not a compatibility test.
- Results must not include percentages, scores, red flags, or "suitable / unsuitable" wording.
- First MVP should optimize for a fun 15-20 minute two-person flow.
- Open-ended questions should stay minimal in early MVP.

## Technical Decisions

- Frontend is Vite + React + TypeScript.
- UI uses the existing custom CSS direction and lucide icons.
- Current live flow uses localStorage through `localRoomRepository`.
- Room logic is split from UI through `RoomRepository`.
- Production is Vercel.
- GitHub is public and CI/CD is configured.

## Backend Decisions

- Supabase is now the primary backend path because a free slot is available.
- Supabase anonymous auth is preferred for the first no-account MVP.
- Supabase Postgres stores rooms, participants, room questions, answers, and result summaries.
- Supabase Realtime can power two-device room progress. Postgres Changes is acceptable for MVP; Broadcast can be considered later if scale/security needs grow.
- Explicit grants and RLS are required for exposed tables.
- Upstash Redis is fallback only if Supabase becomes blocked again.
- Vercel Functions are still needed later for OpenAI result generation so `OPENAI_API_KEY` stays server-side.

## CI/CD Decisions

- Main required checks:
  - `Lint, Test, Build`
  - `Playwright Smoke`
  - `Supabase Schema`
- Deploy workflow verifies releases. Vercel Git integration currently handles production deployment.
- `VERCEL_TOKEN` is not required while Vercel Git integration is enough, but CLI deploy steps skip without it.

## Collaboration Decisions

- `AGENTS.md` is the entrypoint for Codex and other agents.
- `CLAUDE.md` is the Claude-specific entrypoint.
- Agents should update `docs/ai/WORK_LOG.md` after meaningful changes.
- Agents should update `docs/ai/NEXT_ACTIONS.md` when priorities change.
