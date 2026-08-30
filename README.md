# Sohbetlik

> **Doğru cevaplar değil, güzel sohbetler.** — *Not right answers, but good conversations.*

[![CI](https://github.com/enesgarip/sohbetlik/actions/workflows/ci.yml/badge.svg)](https://github.com/enesgarip/sohbetlik/actions/workflows/ci.yml)
[![Production](https://img.shields.io/badge/live-sohbetlik.vercel.app-blue)](https://sohbetlik.vercel.app)

Sohbetlik ("a little chat" in Turkish) is a two-person, AI-assisted conversation PWA for dates. Two people answer the same lightweight question set on their own phones, then see their shared points, different perspectives, and conversation starters — together.

It is deliberately **not** a personality test or a compatibility engine:

- No compatibility scores or percentages.
- No "match / no match" verdicts.
- No judgmental language — results are written to invite conversation, not to grade people.

**Live app:** <https://sohbetlik.vercel.app> (UI is in Turkish)

## How It Works

1. **Create a room** — the host opens the app and starts a session. No sign-up required; participants are anonymous Supabase Auth users.
2. **Invite** — the host shares an invite link or QR code. The guest joins from their own device.
3. **Answer** — both participants answer the same 16 questions (multiple choice and sliders). Answers sync in real time between devices.
4. **See results together** — once both finish, the results page shows common ground, differing perspectives, behavioral tendencies, a question-by-question comparison, and AI-generated conversation prompts tailored to the actual answers.
5. **Go deeper** — after completing a level, the pair can continue to the next one (Levels 1–4), with a guarantee that questions from the previous session don't repeat.

### The Question System

- Question pools live in the codebase as content-as-code (`src/content/`), organized into 4 levels of increasing depth, each question tagged with categories and traits.
- A selection engine (`src/domain/questionSelection.ts`) builds each 16-question session: level mix, trait/category caps, question-type pacing, and dedicated opener/closer slots.
- Slider answers are never shown as numbers, and option order is shuffled with a room-seeded order shared by both devices.
- A device-level history avoids serving recently seen questions when hosting new rooms.
- A mechanical content lint (`npm run questions:lint`) gates question quality in CI.

### AI Summaries

When both participants have answered, a Vercel serverless function (`api/summary.ts`) generates personalized conversation insights with Groq (Llama 3.3 70B). The API key stays server-side. If the AI call fails or is unavailable, the app falls back to locally generated insights — the flow never breaks.

## Architecture

```
React PWA (Vite + TypeScript)
   │
   ├── RoomRepository interface
   │      ├── supabaseRoomRepository   → production: anonymous auth, Postgres, Realtime
   │      └── localRoomRepository     → localStorage fallback (no env vars needed)
   │
   ├── useRoom hook → initial fetch + Realtime subscription + 3s polling fallback
   │
   └── Vercel Functions (api/) → server-side AI summaries via Groq
```

- **Backend:** Supabase — anonymous sign-ins, Postgres with row-level security and explicit grants, Realtime for two-device sync. All schema changes are versioned migrations in `supabase/migrations/`.
- **Fallback-first:** when `VITE_SUPABASE_*` env vars are absent (local dev, preview deploys), the exact same UI runs on a localStorage-backed repository.
- **Reliability details:** debounced slider writes with flush-on-next, a pending-answers ledger so stale snapshots can't wipe a just-given answer, and automatic cleanup of rooms older than 7 days.

### Routes

| Route | Purpose |
| --- | --- |
| `/` | Home — create a room |
| `/join/:roomCode` | Guest joins via invite link / QR |
| `/room/:roomId` | Room lobby |
| `/answer/:roomId/:participantId` | Answer flow |
| `/waiting/:roomId/:participantId` | Waiting for the other participant |
| `/results/:roomId/:participantId` | Shared results |

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, React Router, TanStack Query, Radix UI, PWA (installable, offline-capable shell)
- **Backend:** Supabase (Auth, Postgres, Realtime), Vercel Functions
- **AI:** Groq (Llama 3.3 70B), server-side only
- **Quality:** oxlint, Vitest (unit + content lint), Playwright (e2e incl. two-device sync spec), GitHub Actions CI, Supabase schema checks

## Getting Started

```bash
npm install
npm run dev
```

That's it — with no env vars, the app runs fully on the localStorage fallback, so you can try the whole room → invite → answer → results flow locally (use two browser profiles/tabs for two participants).

### Environment Variables

See `.env.example`:

```bash
VITE_SUPABASE_URL=              # Supabase project URL (optional locally)
VITE_SUPABASE_PUBLISHABLE_KEY=  # Supabase publishable key (optional locally)
GROQ_API_KEY=                   # Server-side only — never expose as VITE_*
```

- Leave `VITE_SUPABASE_*` unset to use the localStorage fallback.
- `GROQ_API_KEY` is consumed only by Vercel Functions; it must never be prefixed with `VITE_` or shipped to the client.
- Preview deployments intentionally leave `VITE_SUPABASE_*` unset so test rooms are never written to production data.

### Commands

```bash
npm run lint          # oxlint
npm run test:unit     # Vitest (includes question content lint)
npm run questions:lint # content quality gate only
npm run build         # tsc + vite build
npm run test:e2e      # Playwright
npm run ci:local      # lint + typecheck + unit + build + e2e in one go
```

### Local Supabase (optional)

Requires Docker.

```bash
npm run db:start:local              # start local Supabase stack
npm run db:lint:local               # lint database schema
npx supabase migration list --local # verify migrations
npm run db:reset:local              # re-apply migrations + seeds
npm run db:stop:local
```

## Project Structure

```
api/                  Vercel serverless functions (AI summary, admin utilities)
src/
  components/        UI components (share card, comparisons, theme toggle, ...)
  content/           Question pools (Levels 1-4), categories, trait registry
  domain/            Core logic: rooms, results, question selection
  hooks/             useRoom and friends
  lib/               seen-question history, pending-answer ledger, helpers
  repositories/      RoomRepository interface + Supabase / localStorage implementations
supabase/migrations/  Versioned schema: tables, RLS, grants, seeds, cleanup function
tests/                Playwright e2e (app flow + two-device sync)
docs/                 Product spec, MVP plan, architecture and AI-agent handoff docs
```

## Documentation

- [Product Spec](docs/PRODUCT_SPEC.md)
- [MVP Plan](docs/MVP_PLAN.md)
- [Backend Sync Strategy](docs/architecture/BACKEND_SYNC_STRATEGY.md)
- [GitHub and CI/CD](docs/GITHUB_CICD.md)
- [Project State](docs/ai/PROJECT_STATE.md) · [Next Actions](docs/ai/NEXT_ACTIONS.md) · [Decision Log](docs/ai/DECISION_LOG.md)
- [Agent Guide](AGENTS.md) · [Claude Handoff](CLAUDE.md) — this repo is co-developed with AI agents
- [Initial Design Concept](docs/design/initial-mobile-flow-concept.png)

## Deployment

Pushes to `main` run CI (lint, unit tests, build, Playwright smoke, Supabase schema checks) and deploy to Vercel. Database changes ship as Supabase CLI migrations. Production requires `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and `GROQ_API_KEY` in the Vercel environment.

## Product Principles

These are non-negotiable and enforced across the codebase and docs:

1. The app is a conversation helper, not a test — results must invite dialogue, never judge.
2. No compatibility scores, ever.
3. Free-tier friendly: Supabase + Vercel free plans carry the MVP.
4. Privacy-light by design: anonymous auth, no accounts, rooms auto-deleted after 7 days.
