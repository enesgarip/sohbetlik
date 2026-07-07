# Next Actions

Last updated: 2026-07-07

## Current Priority

Implement real two-device sync with Supabase.

## Step 1: Link Supabase Project

- Get the new Supabase project ref from the dashboard.
- Run `npx supabase login` if not authenticated.
- Run `npx supabase link --project-ref <project-ref>`.
- Add local env values in `.env.local`:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`
- Add the same frontend-safe env values to Vercel.

## Step 2: Verify And Push Schema

- Run local checks:
  - `npm run db:start:local`
  - `npm run db:lint:local`
  - `npx supabase migration list --local`
  - `npm run db:stop:local`
- Run remote dry run:
  - `npx supabase db push --linked --dry-run`
- Push migrations if the dry run is correct:
  - `npx supabase db push --linked`
- Generate fresh types:
  - `npx supabase gen types --linked --schema public > src/types/supabase.ts`

## Step 3: Implement Supabase Room Repository

- Add anonymous sign-in bootstrap.
- Add `supabaseRoomRepository` matching `RoomRepository`.
- Keep `localRoomRepository` as fallback when Supabase env is missing.
- Create/join rooms through Supabase tables.
- Save answers through Supabase.
- Read room progress from Supabase.

## Step 4: Add Sync

- Start with Supabase Realtime Postgres Changes for rooms, participants, answers, and result summaries.
- Keep polling fallback if subscription fails.
- Add e2e coverage for host and guest contexts.

## Step 5: AI Summary

- Add server-side Vercel Function for OpenAI summary generation.
- Store generated summary in `result_summaries`.
- Keep output language non-judgmental and conversation-focused.

## Do Not Start Yet

- Large question pool expansion.
- Paid features.
- Full account system.
- Public admin panel.
