# Last Gate AI — agent instructions

Last Gate AI is a Next.js 16 App Router application using TypeScript, React 19, Tailwind CSS 4, shadcn/ui, Prisma 7, and SQLite for local development. Verify paths with `rg --files` before editing; do not assume a Vite, Pages Router, Laravel, or Bootstrap layout.

## Project layout

- `app/`: App Router pages, layouts, and API Route Handlers.
- `components/`: UI and feature components; reuse `components/ui/*` before adding primitives.
- `lib/`: shared utilities, integrations, domain workflows, and the generated Prisma client.
- `types/`: shared TypeScript types.
- `prisma/schema.prisma`: database schema; migrations live in `prisma/migrations/`.
- `scripts/`: setup, database backup/restore, and maintenance scripts.
- `docs/`: versioned documentation. `workflow_guide/` is local-only and ignored by Git.

## Implementation rules

- Keep changes surgical and match existing naming, formatting, and shadcn conventions.
- Prefer Server Components; use `"use client"` only for hooks, browser APIs, or interactive client state.
- Add server endpoints under `app/api/**/route.ts`, using proper HTTP status codes and user-friendly errors.
- Put reusable business logic in `lib/`, not directly in page or route files.
- Use the existing Prisma client from `lib/db.ts`; update the schema and migration workflow together when changing persistence.
- Do not add dependencies, ORMs, chart libraries, Laravel, Bootstrap, or jQuery without explicit approval.
- If a new file is required, identify it as `NEW:` in the plan and place it under the existing project structure.

## Integrations and secrets

- GitHub access uses `@octokit/rest`/fetch with `GITHUB_TOKEN` from the environment. Never commit or expose tokens.
- AI features use the Vercel AI SDK and must be gated by `AI_GATEWAY_API_KEY` or the configured provider key.
- Keep secrets in `.env.local`; never log them or send them to client components. `.env.example` may contain names and safe placeholders only.

## Verification

- Run `npm run lint` after code changes. Run `npm run build` for changes affecting routes, Prisma, configuration, or production behavior.
- Check `git diff` and `git status --short` before finishing; do not include local databases, backups, generated build output, or `workflow_guide/`.
- Report changed files, tests run, and any limitations caused by missing environment variables.
