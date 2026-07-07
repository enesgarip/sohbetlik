# Supabase Setup

Last updated: 2026-07-07

## Goal

Use Supabase as the primary backend for real two-device Sohbetlik rooms.

## Official References

- Anonymous sign-ins: <https://supabase.com/docs/guides/auth/auth-anonymous>
- Realtime Postgres Changes: <https://supabase.com/docs/guides/realtime/postgres-changes>
- Realtime subscription options: <https://supabase.com/docs/guides/realtime/subscribing-to-database-changes>
- Securing Data API with RLS: <https://supabase.com/docs/guides/api/securing-your-api>
- Data API explicit grants breaking change: <https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically>
- Type generation: <https://supabase.com/docs/guides/api/rest/generating-types>

## Dashboard Checklist

1. Create or choose the new Supabase project.
2. Copy the project ref.
3. Enable anonymous sign-ins.
4. Copy:
   - Project URL
   - publishable key
5. Do not copy service-role or secret keys into frontend env files.

## Local Env

Create `.env.local` locally. Do not commit it.

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
OPENAI_API_KEY=
```

`OPENAI_API_KEY` is for server-side code only. Do not prefix it with `VITE_`.

## Vercel Env

Add these to Vercel project env:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- later: `OPENAI_API_KEY` for server-side AI summary

## CLI Commands

The Supabase CLI command shapes were checked on 2026-07-07 with `--help`.

Authenticate:

```bash
npx supabase login
```

Link the project:

```bash
npx supabase link --project-ref <project-ref>
```

Dry-run remote migrations:

```bash
npx supabase db push --linked --dry-run
```

Push remote migrations:

```bash
npx supabase db push --linked
```

Generate TypeScript types:

```bash
npx supabase gen types --linked --schema public > src/types/supabase.ts
```

## Local Verification

```bash
npm run db:start:local
npm run db:lint:local
npx supabase migration list --local
npm run db:stop:local
```

## Security Notes

- RLS must stay enabled on exposed tables.
- New public schema tables may need explicit `GRANT` statements before the Data API can access them.
- Anonymous users use the `authenticated` database role after anonymous sign-in, so policies must still restrict rows by ownership/membership.
- Do not rely on `TO authenticated` alone for authorization.
- Never use `auth.role()` in new policies.
- Do not use `user_metadata` for authorization decisions.
- Do not use `SECURITY DEFINER` to bypass RLS unless there is a narrow, audited reason.

## Expected MVP Access Model

- Host creates an anonymous Supabase session.
- Host creates a room.
- Guest opens invite link, creates an anonymous session, and joins the room.
- Both users can read room shell, participants, room questions, answers for that room, and final result summary.
- Each user can only write their own participant row and answers.
- AI summary generation should happen server-side later.
