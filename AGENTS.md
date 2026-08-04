# Last Gate AI — agent instructions

Next.js App Router + TypeScript + shadcn/ui under `app/`, `components/`, `lib/`. Shared types in `types/`. Database via Prisma (`prisma/schema.prisma`). Verify every path with search before editing — do not assume a Vite or Laravel layout.

## Stack

- **UI:** shadcn/ui + Tailwind CSS. Use existing `components/ui/*` before custom CSS.
- **Database:** Prisma + SQLite (dev). Schema in `prisma/schema.prisma`; client via `lib/db.ts`.
- **Server routes:** `app/api/**/route.ts` — Route Handlers, not Pages API.
- **Do not** introduce Laravel, Bootstrap 4, or jQuery unless explicitly requested.

## Path discipline

- Verify paths exist before editing or `@`-mentioning them.
- Prefer `app/api/` for server routes, `lib/` for shared utilities, `components/ui/` for shadcn primitives.
- If a new file is required, prefix it with `NEW:` in the plan and place it under the existing structure.

## Editing rules

- Surgical changes only — no unrelated refactors.
- Match existing naming, file layout, and shadcn conventions.
- No new dependencies without permission (AI SDKs, ORMs, heavy chart libraries).
- Server Components by default; `"use client"` only when hooks or browser APIs are needed.

## Integrations

- **GitHub:** `@octokit/rest` or fetch with `GITHUB_TOKEN` from env. Never commit tokens.
- **AI:** Vercel AI SDK (`ai` package). Gate on `AI_GATEWAY_API_KEY` or provider key in env.
- **Errors:** Proper HTTP status codes from Route Handlers; user-friendly messages in UI.
- **Secrets:** `.env.local` is gitignored — never log or expose tokens to the client.

## When you finish a task

Report changed files, what you tested, and any known limitations blocked on env vars.
