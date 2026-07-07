# GitHub and CI/CD Setup

## Repository

Default repository target:

```text
enesgarip/projectx
```

The repository is intended to start private. It can be made public later from GitHub settings.

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
enesgarips-projects/projectx
```

## Required Vercel Environment Variables

Set these in Vercel for production and preview environments:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
OPENAI_API_KEY
```

`OPENAI_API_KEY` must never be exposed as a `VITE_` variable.

## Branch Protection Recommendation

For `main`, require these checks before merging:

- `Lint, Test, Build`
- `Playwright Smoke`
- `Supabase Schema`

Also enable:

- Require pull request before merging.
- Require branches to be up to date.
- Dismiss stale approvals when new commits are pushed.
