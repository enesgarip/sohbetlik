# Next Actions

Last updated: 2026-07-09

## Current Priority

AI Summary is DONE — all three nice-to-have polishes are also shipped. Next milestone TBD.

## Recently Completed

- AI Summary: Vercel serverless function (`api/summary.ts`) calls Groq (Llama 3.3 70B) with answer pairs + followupPrompt + aiHint. Client fetches on results page when both participants have answered; falls back to local insights if API unavailable. `GROQ_API_KEY` env var needed on Vercel production. Results page shows a green "Cevaplarınıza özel AI analizi" badge when AI insights are present. Simulate-guest button removed from UI; `api/simulate-guest.ts` kept for programmatic testing.
- `/room/:roomId` viewer resolution: page now finds the viewer's own participant via `getViewerParticipant`; non-participants are redirected to `/join/:roomCode`.
- Slider debounce: network writes are delayed 300ms; flushed on "Sonraki soru" so no answer is lost.
- Stale room cleanup: `cleanup_stale_rooms()` Postgres function deletes rooms >7 days old (CASCADE); called from client on homepage load, throttled to once per 24h via localStorage.
- New migration: `20260709090000_cleanup_stale_rooms.sql`.

## Nice-To-Have Follow-Ups

- Preview env vars on Vercel (currently falls back to localStorage).

## Do Not Start Yet

- Large question pool expansion.
- Paid features.
- Full account system.
- Public admin panel.
