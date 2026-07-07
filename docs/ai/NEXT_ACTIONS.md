# Next Actions

Last updated: 2026-07-08

## Current Priority

Ship the pending work to production.

Supabase production setup is DONE (2026-07-08): project `sohbetlik` (`ojhncwhagydpmfnygdfy`, eu-central-1) is linked, all migrations + anonymous auth are live, `.env.local` points at it, types are regenerated, Vercel production env vars are set, and the full e2e suite passes against the production project.

## Step 1: Deploy And Verify Production

- Commit and push the pending work to `main`; Vercel Git integration deploys with the new env vars.
- Open `https://sohbetlik.vercel.app` on two devices: host creates a room, guest joins via QR/link, both answer, results open on both.
- Preview env vars are NOT set (CLI kept demanding a git branch); previews fall back to localStorage mode. Add via dashboard if preview sync is wanted.

## Step 2: AI Summary

- Add a server-side Vercel Function for OpenAI summary generation (`OPENAI_API_KEY` stays server-side).
- Store the generated summary in `result_summaries`.
- Keep output language non-judgmental and conversation-focused.

## Nice-To-Have Follow-Ups

- Resolve the viewer's own participant on `/room/:roomId` instead of assuming host.
- Debounce slider answer writes.
- Room cleanup/retention for stale rooms.

## Do Not Start Yet

- Large question pool expansion.
- Paid features.
- Full account system.
- Public admin panel.
