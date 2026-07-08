# Next Actions

Last updated: 2026-07-09

## Current Priority

Monitor the Level 3-4 rollout, then pick the next product milestone.

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
- Preview backend strategy: preview deploys keep `VITE_SUPABASE_*` unset by default and use localStorage fallback; production Supabase env vars must not be reused for previews. `.env.example`, README, CI/CD, Supabase setup, and decision docs now use `GROQ_API_KEY`.
- Level 3-4 expansion: `src/content/questions/level3.ts` and `src/content/questions/level4.ts` each contain 24 active questions, `questionContents` includes both pools, next-level UI is generalized through Level 4, and `20260710090000_seed_level3_level4_questions.sql` seeds both pools idempotently. Local and production Supabase verification both show active question counts L1=24, L2=24, L3=24, L4=24.
- Production app: `sohbetlik.vercel.app` is aliased to `sohbetlik-h4hzuwrbn-enesgarips-projects.vercel.app` from commit `dd3f1e5`. Live two-device browser QA completed Levels 1-4, verified L2/L3/L4 next-level CTAs, verified no Level 5 CTA after Level 4, and Vercel runtime error/fatal logs were clean for the deployment.

## Nice-To-Have Follow-Ups

- Add `answerWeights` for Level 3-4 questions so the new behavioral tendency cards can use deeper-level answers.
- Create a separate preview Supabase project if two-device preview deployment testing becomes necessary.

## Do Not Start Yet

- Paid features.
- Full account system.
- Public admin panel.
