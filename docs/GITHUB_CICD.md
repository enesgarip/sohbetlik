# GitHub and CI/CD Setup

## Repository

Default repository target:

```text
enesgarip/sohbetlik
```

URL:

```text
https://github.com/enesgarip/sohbetlik
```

The repository is public.

## Workflows

- `CI`: runs on pull requests and pushes to `main`, `develop`, `feature/**`, and `codex/**`.
- `Deploy Production`: runs on push to `main` and manual dispatch.
- `Dependabot`: weekly npm and GitHub Actions dependency PRs.

## CI Gates

The CI workflow runs:

```bash
npm run lint
npm run test:unit
npm run build
npm run test:e2e
npm run db:lint:local
```

The Supabase job starts a local Supabase stack, lints the schema, lists migrations, and shuts the stack down.

## Required GitHub Secrets for Vercel Deploy

Add these repository secrets before expecting production deployment to work:

```text
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

`VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` come from `.vercel/project.json` after the project is linked with Vercel.

Current local Vercel project link:

```text
enesgarips-projects/sohbetlik
```

Production URL:

```text
https://sohbetlik.vercel.app
```

## Required Vercel Environment Variables

Set these in Vercel for the production environment:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
GROQ_API_KEY
```

`GROQ_API_KEY` must never be exposed as a `VITE_` variable.

Preview deployments intentionally leave `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` unset by default, so they use the localStorage fallback instead of writing test rooms into production Supabase. Only set preview Supabase env vars after creating a separate preview Supabase project. Do not reuse production Supabase values for previews.

## Branch Protection Recommendation

For `main`, require these checks before merging:

- `Lint, Test, Build`
- `Playwright Smoke`
- `Supabase Schema`

Also enable:

- Require pull request before merging.
- Require branches to be up to date.
- Dismiss stale approvals when new commits are pushed.

Current status: branch protection is enabled for `main` with the required CI checks above.
