# Backend Sync Strategy

Date: 2026-07-07

## Decision

For the first real two-device MVP, Sohbetlik will use:

- Vercel Functions for the API boundary.
- Upstash Redis for ephemeral room state.
- Short polling for room progress and result readiness.
- The current localStorage adapter as the offline/local fallback.

Supabase remains the best product fit when a free slot or paid plan is available because it gives Postgres, anonymous auth, and Realtime in one place. It is not the first production backend right now because the Free plan allows two active free projects across organizations where the user is Owner/Admin, and both slots are already used.

Neon Postgres remains the second option if we need relational persistence before Supabase becomes available.

## Why Upstash First

- Rooms are naturally temporary. A date session can expire after 24-48 hours.
- We do not need user accounts for the first public MVP.
- Redis JSON-style room state is enough for:
  - room creation
  - invite code lookup
  - host/guest participants
  - answer progress
  - lightweight result state
- It avoids spending a Supabase slot.
- It keeps secrets server-side in Vercel Functions.
- It is easy to replace later because the app already talks through a `RoomRepository` shape.

## Current Provider Notes

- Supabase Free: two active free projects; paused projects do not count. Source: <https://supabase.com/docs/guides/platform/billing-on-supabase>
- Supabase explicit grants: new projects may require explicit grants for Data API access, separate from RLS. Source: <https://supabase.com/changelog>
- Neon Free: free plan includes 100 projects, 100 CU-hours monthly per project, and 0.5 GB storage per project. Source: <https://neon.com/pricing>
- Upstash Redis Free: free Redis has one database, 256 MB max data size, and 500K monthly commands. Source: <https://upstash.com/pricing/redis>
- Vercel Marketplace supports Neon and Upstash provisioning for Vercel projects. Sources: <https://vercel.com/marketplace/neon>, <https://vercel.com/marketplace/upstash>

## API Shape

The frontend should eventually swap from `localRoomRepository` to a network repository with this API surface:

- `POST /api/rooms`
  - Creates a room.
  - Returns `{ room, participantId, participantToken }`.
- `POST /api/rooms/:code/join`
  - Joins the invite code as guest.
  - Returns `{ room, participantId, participantToken }`.
- `GET /api/rooms/:roomId`
  - Returns the current room snapshot.
  - Requires a participant token.
- `POST /api/rooms/:roomId/answers`
  - Saves one answer.
  - Requires `{ participantId, participantToken, questionId, value }`.
- `POST /api/rooms/:roomId/results`
  - Later: starts or returns the AI result summary.

## Redis Data Model

Use two keys per room:

- `room:{roomId}` -> JSON room snapshot
- `room-code:{code}` -> `roomId`

Both keys should use the same TTL.

Recommended first TTL:

- 24 hours for normal MVP rooms.
- Later, 48 hours if users want to revisit results after the date.

Room snapshot:

```json
{
  "id": "room_uuid",
  "code": "HCCJ9K",
  "version": 3,
  "createdAt": "2026-07-07T13:00:00.000Z",
  "expiresAt": "2026-07-08T13:00:00.000Z",
  "questionIds": ["daily-pace", "morning-night"],
  "participants": [
    {
      "id": "host_uuid",
      "tokenHash": "server_only_hash",
      "label": "Sen",
      "role": "host",
      "joinedAt": "2026-07-07T13:00:00.000Z",
      "answers": {}
    }
  ],
  "resultSummary": null
}
```

## Sync Strategy

Use polling before adding Realtime:

- Poll `GET /api/rooms/:roomId` every 2 seconds while a participant is answering or waiting.
- Slow to every 5-10 seconds when the tab is hidden.
- Stop polling when both participants are complete and results are visible.
- Use optimistic UI for answer saves.
- Server increments `room.version` on every write.
- Client may send `knownVersion` later so the API can return `304`-style empty responses.

This is enough for two people and avoids the complexity of WebSocket hosting.

## Security And Privacy

- Do not put secret service tokens in the browser.
- Invite links contain only the room code.
- Participant write access uses a random `participantToken` returned after create/join.
- Store the participant token only in browser storage for that participant.
- Hash participant tokens before storing them in Redis.
- Rate-limit room creation and join attempts by IP.
- Do not store names, phone numbers, emails, or personal identifiers in the MVP.
- Expire rooms automatically with Redis TTL.

## Provider Upgrade Path

### Stay On Upstash

Good while rooms are ephemeral and usage is small.

### Move To Neon

Use when we need:

- relational analytics
- a durable question admin surface
- long-lived result history
- SQL reporting

The app keeps polling via Vercel Functions.

### Move To Supabase

Use when we can free a project slot or choose a paid plan.

Then we can use:

- Postgres tables already modeled in `supabase/migrations`
- anonymous auth
- Realtime subscriptions
- RLS with explicit grants for exposed tables

## Next Implementation Steps

1. Add `api/rooms` Vercel Functions.
2. Add `redisRoomRepository` on the server side.
3. Add a frontend `remoteRoomRepository` that calls the API.
4. Add env placeholders for `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.
5. Keep `localRoomRepository` as local/dev fallback.
6. Add e2e coverage for cross-context host + guest flow.
