# Project State

Last updated: 2026-07-07

## Product

Sohbetlik is a two-person, AI-assisted conversation PWA for dates.

It is not a personality test or compatibility engine. It should help two people answer the same lightweight question set, then see shared points, different perspectives, and conversation prompts.

Core slogan:

> Dogru cevaplar degil, guzel sohbetler.

## Live Links

- Production: <https://sohbetlik.vercel.app>
- GitHub: <https://github.com/enesgarip/sohbetlik>

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
- Current room state is localStorage-backed via `localRoomRepository`.
- `RoomRepository` interface exists for swapping in Supabase.

## Backend State

- Supabase free project slot is now available.
- Primary backend direction is Supabase:
  - anonymous auth
  - Postgres tables
  - RLS
  - explicit grants
  - Realtime or polling fallback
- Local Supabase Docker config and initial migration already exist.
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

- Production two-device sync is not implemented yet.
- Supabase project is not linked in repo yet.
- Vercel environment variables for Supabase need to be set.
- Supabase generated types should be refreshed after remote migration push.
- Result AI generation is still local/mock logic, not OpenAI-backed.
- Question pool is still small and demo-oriented.
