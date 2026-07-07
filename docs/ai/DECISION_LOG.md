# Decision Log

Last updated: 2026-07-08

## Product Decisions

- Product name is `Sohbetlik`.
- The app is a conversation helper, not a compatibility test.
- Results must not include percentages, scores, red flags, or "suitable / unsuitable" wording.
- First MVP should optimize for a fun 15-20 minute two-person flow.
- Open-ended questions should stay minimal in early MVP.

## Question System Decisions (2026-07-08)

- `docs/product/QUESTION_WRITING_GUIDE.md` is the binding quality standard for every question; the mechanical part is enforced by `npm run questions:lint`, the judgment part by review.
- Questions live in the repo (`src/content/questions/`) as the single source of truth and are seeded to the DB via idempotent migrations (`on conflict (slug) do update`). `qualityNote` never leaves the repo.
- Three orthogonal axes: category slug (topic), level 1-4 (depth), trait (probed characteristic, internal-only — never shown, never scored, never aggregated into profiles).
- Sessions mix levels (e.g. a level 2 room = 25% L1 + 75% L2) and follow a peak-end curve: two light openers, rising intensity, warm closer.
- Set constraints: ≤2 questions per trait, ≤3 per category, ~35/45/20 type split, no same-trait/category neighbors, no 3 same-type in a row.
- Slider answers are never displayed as numbers anywhere (answer screen, results, AI output); the scale lives in `questions.meta.slider` with two positively-framed end labels.
- Option order is shuffled per question with a `roomId:questionId` seed so both participants see the identical order; questions with a punchline option opt out via `shuffle_options = false`.
- Non-repeat: hard guarantee via room chain (`rooms.previous_room_id`, UI pending); soft layer via host-device localStorage history (90-day TTL, relaxed before a session can starve).
- The original 8 demo questions are deactivated, not deleted (FK integrity + legacy rooms render from the client lookup map).

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
- Frontend question ids stay human-readable slugs; `questions.slug` (unique) maps them to DB uuid primary keys.
- MVP questions are seeded inside a migration (not `supabase/seed.sql`) so `db push` seeds remote too.
- Room `status` is never set to `completed` in MVP because guest RLS read access requires an open status; revisit when access moves to membership-based policies.
- Participants select policy mirrors the rooms shell policy (open rooms readable) instead of a self-referencing membership check, to avoid RLS recursion.
- Client sync = Realtime Postgres Changes + always-on 3s polling fallback while the tab is visible.

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
