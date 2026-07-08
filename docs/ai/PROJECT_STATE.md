# Project State

Last updated: 2026-07-09

## Product

Sohbetlik is a two-person, AI-assisted conversation PWA for dates.

It is not a personality test or compatibility engine. It should help two people answer the same lightweight question set, then see shared points, different perspectives, and conversation prompts.

Core slogan:

> Dogru cevaplar degil, guzel sohbetler.

## Live Links

- Production: <https://sohbetlik.vercel.app>
- GitHub: <https://github.com/enesgarip/sohbetlik>
- Latest production deploy verified: 2026-07-09 (`sohbetlik-7v7p3d4bt-enesgarips-projects.vercel.app`, aliased to `https://sohbetlik.vercel.app`)

## Current Implementation

- Vite + React + TypeScript frontend.
- PWA config exists.
- Public GitHub repo and Vercel production deployment are configured.
- GitHub Actions CI exists for lint/test/build, Playwright smoke, and Supabase schema checks.
- Branch protection exists on `main`; direct pushes by admin currently bypass PR requirements.
- Local room flow works:
  - `/`
  - `/room/:roomId`
  - `/join/:roomCode`
  - `/answer/:roomId/:participantId`
  - `/waiting/:roomId/:participantId`
  - `/results/:roomId/:participantId`
- `RoomRepository` is async and includes `subscribeToRoom`.
- `supabaseRoomRepository` is implemented (anonymous auth, Postgres reads/writes, Realtime subscription).
- `activeRoomRepository` picks Supabase when `VITE_SUPABASE_*` env exists, else the localStorage `localRoomRepository`.
- `useRoom` hook drives all room pages: initial fetch + Realtime + 3s polling fallback.
- Two-device sync is verified end-to-end against the local Supabase stack (`tests/sync.spec.ts`).
- Two-device sync is verified end-to-end against production on `https://sohbetlik.vercel.app` (host + guest contexts, 24 answers each, results visible on both).
- Question system is implemented (2026-07-08):
  - Content-as-code: `src/content/` holds categories, trait registry, the live 24-question Level 1 pool, and a 24-question Level 2 pool.
  - Level 2 has a production seed migration and next-level/rematch UI in code: after both participants complete Level 1, results can offer `Seviye 2'ye geç`.
  - Quality docs: `docs/product/QUESTION_WRITING_GUIDE.md` (standard), `docs/product/QUESTION_SYSTEM_DESIGN.md` (architecture), `docs/product/QUESTIONS_LEVEL1.md` (approved pool).
  - `src/domain/questionSelection.ts` picks and orders 24 questions per session (level mix, trait/category caps, type pacing, opener/closer slots).
  - Mechanical content gate: `npm run questions:lint` (also runs inside `test:unit`).
  - Device-level seen-question history (`src/lib/seenQuestions.ts`) excludes recently seen questions when hosting.
  - Slider answers are never rendered as numbers; option order is shuffled with a room-seeded order shared by both devices.

## Backend State

- Production Supabase project is live (2026-07-08): `sohbetlik`, ref `ojhncwhagydpmfnygdfy`, region eu-central-1. Linked via CLI; all migrations pushed; anonymous sign-ins enabled via `config push`; `.env.local` points at it; Vercel production env vars set. DB password is in gitignored `db-password.local` on the dev machine.
- Primary backend direction is Supabase:
  - anonymous auth
  - Postgres tables
  - RLS
  - explicit grants
  - Realtime or polling fallback
- Local Supabase Docker config and five migrations exist:
  - `20260707112731_initial_mvp_schema.sql` (tables, RLS, grants, realtime publication)
  - `20260707150000_seed_questions_and_room_access.sql` (question slugs + seed, guest participant reads, room delete)
  - `20260708090000_question_metadata_and_level1_pool.sql` (question metadata columns, `rooms.previous_room_id`, demo questions deactivated, 24-question Level 1 pool seeded)
  - `20260709090000_cleanup_stale_rooms.sql` (SECURITY DEFINER function to delete rooms >7 days old)
  - `20260709093000_seed_level2_questions.sql` (24-question Level 2 pool seeded idempotently by slug)
- MVP question slugs map to DB uuids through `questions.slug`; questions are seeded in the migration (not `seed.sql`) so remote pushes get them.
- Room `status` is intentionally never set to `completed` in MVP: guest RLS read access depends on the room staying open.
- Upstash Redis remains only a fallback if Supabase becomes blocked again.

## Important Files

- Agent entrypoint: `AGENTS.md`
- Claude entrypoint: `CLAUDE.md`
- Current state: `docs/ai/PROJECT_STATE.md`
- Next actions: `docs/ai/NEXT_ACTIONS.md`
- Decision log: `docs/ai/DECISION_LOG.md`
- Backend sync strategy: `docs/architecture/BACKEND_SYNC_STRATEGY.md`
- Supabase setup: `docs/ai/SUPABASE_SETUP.md`
- Product spec: `docs/PRODUCT_SPEC.md`
- MVP plan: `docs/MVP_PLAN.md`
- Room domain: `src/domain/rooms.ts`
- Result domain: `src/domain/results.ts`
- Room repository interface: `src/repositories/roomRepository.ts`
- Local room repository: `src/repositories/localRoomRepository.ts`
- Supabase migration: `supabase/migrations/20260707112731_initial_mvp_schema.sql`

## Known Gaps

- `src/types/supabase.ts` is now CLI-generated from the linked project; regenerate after future migration pushes.
- `/room/:roomId` now resolves the viewer's own participant via `getViewerParticipant`; non-participants are redirected to `/join/:roomCode`.
- Slider answer writes are debounced (300ms); the pending value is flushed on "Sonraki soru" to prevent loss.
- Stale rooms (>7 days) are cleaned up via `cleanup_stale_rooms()` Postgres function, called from the client on homepage load (throttled to once per day).
- Optimistic answer writes are protected by a pending-answers ledger (`src/lib/pendingAnswers.ts`); stale snapshots can no longer wipe a just-given answer.
- Result AI generation uses Groq (Llama 3.3 70B) via Vercel Function (`api/summary.ts`); falls back to local logic if API unavailable. Results page shows a green "Cevaplarınıza özel AI analizi" badge when AI insights are present. `GROQ_API_KEY` env var needed on Vercel production.
- Simulate-guest UI button removed; `api/simulate-guest.ts` endpoint kept for programmatic testing only.
- Initial sessions still start at Level 1. After both participants complete the room, the results page can offer `Seviye 2'ye geç`; Level 3-4 flows are not built yet.
- `rooms.previous_room_id` is now written for next-level rooms; the current hard non-repeat guarantee covers the immediately previous room's question slugs.
- Guest device history cannot be excluded at initial room creation (guest joins later); the room-chain layer handles the next-level hard guarantee.
