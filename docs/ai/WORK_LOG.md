# Work Log

## 2026-07-07

- Project named Sohbetlik.
- Public GitHub repo created: `https://github.com/enesgarip/sohbetlik`.
- Production Vercel URL configured: `https://sohbetlik.vercel.app`.
- GitHub Actions CI/CD configured with lint/test/build, Playwright smoke, and Supabase schema checks.
- Branch protection enabled on `main`; admin direct pushes currently bypass PR requirement.
- Initial Vite + React + TypeScript PWA flow built.
- Local room, invite, answer, waiting, and results flow implemented.
- Real QR generation added.
- `RoomRepository` interface added for backend swapping.
- Initial Supabase schema migration and local Docker config added.
- Temporary backend strategy was Upstash-first while Supabase free slot was blocked.
- Supabase slot became available, so backend strategy changed to Supabase-first.
- Agent collaboration system added with `AGENTS.md`, `CLAUDE.md`, and `docs/ai/*` files.
- Claude web bootstrap prompt and source index added so Claude Pro can join without rescanning the repo.
