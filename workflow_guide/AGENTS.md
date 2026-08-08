# AGENTS.md — AI Coding Rules for Last Gate AI

## Stack reality

- **Next.js 15 App Router + TypeScript** under `app/`, `components/`, `lib/`, `types/`.
- **UI:** shadcn/ui + Tailwind CSS. Use existing `components/ui/*` primitives before custom CSS.
- **Database:** Prisma + SQLite (dev). Schema in `prisma/schema.prisma`; client via `lib/db.ts`.
- **Server routes:** `app/api/**/route.ts` — use Route Handlers, not Pages API.
- **Do not** introduce Laravel, Bootstrap 4, or jQuery unless explicitly requested.

## Path discipline

- **Verify before edit:** Search or list the repo for real paths. Never invent `src/pages/`, `resources/views/`, or fictional API trees.
- **Prefer `lib/`** for GitHub client, AI helpers, and DB utilities.
- **`@`-mentions in Cursor:** Attach only files the task actually touches (typically 3–5).

## Core principles

- **Correctness over cleverness:** Portfolio intelligence requires accurate Git metadata and safe API handling.
- **Surgical changes only:** Minimal, targeted edits. No refactoring unrelated code during feature work.
- **Follow existing patterns:** Match file structure, naming, and shadcn conventions already in the repo.
- **No new dependencies without permission:** Especially for AI SDKs, ORMs, or heavy chart libraries.

## Editing style

- **Be concise:** Minimize chat explanations. Show code, not commentary.
- **Ask when unclear:** Request clarification before coding ambiguous requirements.
- **Summary required:** Always end with: `Modified files: [list] | Reason: [brief]`
- **No assumptions:** Don't guess at file paths, component names, or API signatures — verify first.

## TypeScript rules

- Use strict types in `types/` for shared contracts (`Application`, `GitMetadata`, `Task`, etc.).
- Prefer `interface` for data shapes; `type` for unions and utility types.
- Server Components by default; add `"use client"` only when hooks or browser APIs are required.

## API and integration rules

1. **GitHub:** Use `@octokit/rest` or fetch with `GITHUB_TOKEN` from env. Never commit tokens.
2. **AI summaries:** Use Vercel AI SDK (`ai` package). Gate on `AI_GATEWAY_API_KEY` or provider key in env.
3. **Errors:** Return proper HTTP status codes from Route Handlers; surface user-friendly messages in UI.
4. **Rate limits:** Cache `GitMetadata` in DB; manual "Sync now" before background jobs.

## Security and safety

- Validate all user input on API routes (Zod recommended).
- Sanitize repo URLs before GitHub API calls.
- Never log secrets or expose tokens to the client.
- `.env.local` is gitignored — document vars in `workflow_guide/AI_PROJECT_STATE.md` only.

## Anti-patterns for Last Gate AI

- No `// TODO: implement later` placeholders in shipped features
- No deleting existing functionality without explicit request
- No hardcoded GitHub tokens or API keys
- No direct DOM manipulation outside focused client components
- No embedding Kanboard/PHP monoliths — study patterns, build native features

## Testing expectations

- Run `npm run dev` and verify UI flows after changes
- API routes: test with curl or browser network tab
- Prisma: run `npx prisma migrate dev` after schema changes

## Communication protocol

When you complete a task, report:

1. **Changed files:** List of modified/created files
2. **Testing done:** What you verified works
3. **Known limitations:** Anything deferred or blocked on env vars
