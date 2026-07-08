# Backend Sync Strategy

Date: 2026-07-07

## Decision

For the first real two-device MVP, Sohbetlik uses Supabase as the primary backend:

- Supabase Auth with anonymous users.
- Supabase Postgres for rooms, participants, questions, answers, and result summaries.
- Supabase Realtime for room progress and result readiness.
- Polling fallback if Realtime setup is delayed or fails.
- Vercel Functions for Groq-backed AI result generation.

Upstash Redis is now fallback only. It was the temporary plan while the Supabase Free project slots were full, but a Supabase slot is available now.

## Why Supabase First

- The product naturally needs shared state across two devices.
- Anonymous auth lets users participate without email, phone, or account setup.
- Postgres gives durable relational data for rooms, questions, answers, and later analytics.
- RLS lets the frontend use a publishable key while keeping room data constrained.
- Realtime can remove the need for custom WebSocket infrastructure.
- The repo already contains a Supabase local config and initial migration.

## Current Provider Notes

- Anonymous Sign-Ins let users have authenticated sessions without providing PII. Source: <https://supabase.com/docs/guides/auth/auth-anonymous>
- Supabase Realtime supports Postgres Changes and Broadcast. Broadcast is recommended for scalability/security, while Postgres Changes is simpler. Source: <https://supabase.com/docs/guides/realtime/subscribing-to-database-changes>
- Postgres Changes requires Supabase to check access for every subscriber/change pair, so it needs care at scale. Source: <https://supabase.com/docs/guides/realtime/postgres-changes>
- RLS should be enabled on exposed tables and views. Source: <https://supabase.com/docs/guides/api/securing-your-api>
- New tables may require explicit grants to be reachable through the Data API. Source: <https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically>

## Client Architecture

The frontend should keep using a repository boundary:

- `RoomRepository` is the interface.
- `localRoomRepository` remains local/dev fallback.
- `supabaseRoomRepository` becomes the production repository once Supabase env vars exist.

Expected repository behavior:

- `createRoom(questionIds)` signs in anonymously if needed, creates a room, inserts host participant, assigns room questions, and returns `{ room, participantId }`.
- `joinRoomByCode(roomCode)` signs in anonymously if needed, finds the room, inserts guest participant, and returns `{ room, participantId }`.
- `saveAnswer(...)` upserts the participant answer.
- `getRoomById(...)` reads the room snapshot, participants, questions, answers, and result summary.

## Supabase Data Model

Initial migration already includes:

- `rooms`
- `participants`
- `questions`
- `room_questions`
- `answers`
- `result_summaries`

Tables have RLS enabled. The migration already includes explicit grants for `authenticated` and `service_role`.

Anonymous users become authenticated Supabase users, so MVP browser writes should use the `authenticated` role through the publishable key and RLS policies.

## Sync Strategy

MVP path:

- Subscribe to room-related changes for:
  - `rooms`
  - `participants`
  - `answers`
  - `result_summaries`
- Refetch the current room snapshot after a relevant change.
- Poll every 2-3 seconds as fallback while a user is answering or waiting.
- Stop polling/subscriptions when results are visible and stable.

Later scale path:

- Consider Supabase Broadcast for higher scale or stricter event authorization.
- Add server-side result generation with Vercel Functions.
- Add cleanup/retention automation for stale rooms.

## Privacy And Security

- Do not store emails, phone numbers, or personal identifiers in the MVP.
- Use anonymous auth for participants.
- Do not expose service-role or secret keys in frontend code.
- Use only `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in browser code.
- Keep `GROQ_API_KEY` server-side only.
- Do not use `TO authenticated` alone as authorization; combine it with room membership/ownership predicates.
- Do not use `auth.role()` in new policies.
- Do not use user-editable metadata for authorization.
- Prefer direct RLS policies over `SECURITY DEFINER` functions.

## Fallback Path

If Supabase becomes blocked again:

- Use Vercel Functions as the API boundary.
- Use Upstash Redis for temporary room snapshots.
- Keep the same `RoomRepository` shape.
- Expire rooms with Redis TTL.

This fallback should not be implemented unless Supabase is blocked or clearly too heavy for the MVP.

## Operational Follow-Ups

1. Keep production Supabase env vars configured only in production Vercel unless a separate preview Supabase project exists.
2. Leave preview `VITE_SUPABASE_*` env vars unset by default so preview deploys use localStorage fallback and cannot pollute production room data.
3. Regenerate `src/types/supabase.ts` after future migration pushes.
4. Consider Supabase Broadcast later if Postgres Changes becomes too noisy at scale.
5. Add cleanup/retention automation if client-triggered stale room cleanup becomes insufficient.
