# Next Actions

Last updated: 2026-07-09

## Current Priority

Pick the next milestone. Level 2 next-level flow is live and production monitoring is clean.

## Recently Completed

- AI Summary: Vercel serverless function (`api/summary.ts`) calls Groq (Llama 3.3 70B) with answer pairs + followupPrompt + aiHint. Client fetches on results page when both participants have answered; falls back to local insights if API unavailable. `GROQ_API_KEY` env var needed on Vercel production. Results page shows a green "Cevaplarınıza özel AI analizi" badge when AI insights are present. Simulate-guest button removed from UI; `api/simulate-guest.ts` kept for programmatic testing.
- `/room/:roomId` viewer resolution: page now finds the viewer's own participant via `getViewerParticipant`; non-participants are redirected to `/join/:roomCode`.
- Slider debounce: network writes are delayed 300ms; flushed on "Sonraki soru" so no answer is lost.
- Stale room cleanup: `cleanup_stale_rooms()` Postgres function deletes rooms >7 days old (CASCADE); called from client on homepage load, throttled to once per 24h via localStorage.
- New migration: `20260709090000_cleanup_stale_rooms.sql`.
- Homepage sample flow cleanup: removed `Örnek akışı dene`; phone preview now uses pool-independent mini copy.
- Level 2 pool: `src/content/questions/level2.ts` contains 24 active questions and is included in `questionContents`; mechanical content lint covers all implemented levels.
- Level 2 exposure: `20260709093000_seed_level2_questions.sql` seeds Level 2 idempotently, room creation can carry `previous_room_id`, and results can open a Level 2 room after both participants complete Level 1 without repeating the previous room's question slugs.
- Local verification: `questions:lint`, `lint`, `test:unit`, `build`, `test:e2e`, `db reset --local`, and `db lint --local` pass. Local DB active question counts are L1=24 and L2=24; local two-device browser QA reaches the first Level 2 question.
- Production Supabase: Level 2 migration is pushed; remote active question counts are L1=24 and L2=24 after anonymous auth.
- Production app: `sohbetlik.vercel.app` is aliased to the Level 2 deployment and a live two-device L1 -> L2 browser QA reached the first Level 2 question with no console errors or failed requests.
- Production monitoring: Vercel runtime error clusters, error/fatal logs, 5xx counts, and 4xx counts are clean after the Level 2 rollout.

## Nice-To-Have Follow-Ups

- Decide preview backend strategy before setting Vercel preview env vars. Pointing previews at production Supabase would make test rooms write to production data.

## Do Not Start Yet

- Level 3-4 question pool expansion.
- Paid features.
- Full account system.
- Public admin panel.
