# Next Actions

Last updated: 2026-07-09

## Current Priority

Build the AI Summary milestone.

Production Supabase launch is DONE (2026-07-08): project `sohbetlik` (`ojhncwhagydpmfnygdfy`, eu-central-1) is linked, all migrations + anonymous auth are live, `.env.local` points at it, types are regenerated, Vercel production env vars are set, and `https://sohbetlik.vercel.app` is verified with a full host + guest 24-question flow.

## Step 1: AI Summary

- Add a server-side Vercel Function for OpenAI summary generation (`OPENAI_API_KEY` stays server-side).
- Store the generated summary in `result_summaries`.
- Keep output language non-judgmental and conversation-focused.

## Recently Completed

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
