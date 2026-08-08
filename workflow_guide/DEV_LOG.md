# DEV LOG — Last Gate AI

## 2026-06-21 — Bootstrap session

**Agent:** Cursor bootstrap (greenfield plan execution)

**Completed:**
- Created repo at `~/Documents/GitHub/last-gate-ai/` with git initialized
- Generated full `workflow_guide/` Foreman kit (9 files + root `AGENTS.md` + `.cursor/rules/path-discipline.md`)
- Scaffolded Next.js 15 + shadcn/ui + Prisma SQLite + next-themes
- Built Soccer-inspired admin shell (sidebar, topbar, stat cards)
- Implemented Phase 1 MVP foundation per Foreman capsules

**Decisions:**
- Stack: Next.js 15 App Router, TypeScript, shadcn/ui, Tailwind, Prisma + SQLite (dev)
- Design: Soccer admin template density + Figma Make shell; extended with portfolio widgets
- Workflow folder: `workflow_guide/` (Museum Omega convention)
- Agent roles: Foreman + Frontend + Backend + Integrations + Content + QA

**Follow-ups:**
- Add real `GITHUB_TOKEN` and `AI_GATEWAY_API_KEY` to `.env.local` for live sync/summary
- Phase 2: repo stack scanner, architecture mapper
- Phase 3: security agent, Headroom optimization, deployment tracking
- Figma MCP: re-inspect when authenticated for token-level design parity

**Known issues:**
- AI summary returns placeholder when no API key configured
- GitHub sync requires `GITHUB_TOKEN` in environment

## 2026-06-24 — Phase 4 automation

**Agent:** Cursor (Phase 4 plan execution)

**Completed:**
- Added `IntelligenceJob` Prisma model and migration
- Server-side intelligence pipeline orchestrator calling existing lib functions
- Job API routes: `POST /api/intelligence/run`, `GET /api/intelligence/jobs/[id]`, portfolio refresh, cron refresh
- Refactored guided product analysis UI to start jobs and poll progress
- Dashboard "Refresh intelligence" button for portfolio-wide runs
- `vercel.json` weekly cron for stale applications (7-day threshold)
- Installed `@vercel/functions` for `waitUntil` background execution

**Decisions:**
- DB-backed job state (no Redis/BullMQ) for Phase 4 MVP
- Sequential portfolio/cron runs to respect GitHub rate limits
- Cron protected by `CRON_SECRET`; dev allows unauthenticated cron when secret unset

**Follow-ups:**
- Durable queue if Vercel timeout becomes a bottleneck (deferred to Phase 5+)
- Mark remaining UI debt items (health score, cost rollup, etc.)

## 2026-06-25 — Phase 4.5 UX polish

**Agent:** Cursor (Phase 4.5 completion)

**Completed:**
- Dashboard served at `/`; `/dashboard` redirects for backwards compatibility
- Removed broken Turbopack `root` config causing `/` compile panics and reload loops
- `PmViewSwitcher` component for Board/Roadmap navigation on app detail, tasks, roadmap
- Task deep links via `?task=<id>` (search API, overdue widget, Kanban auto-open sheet)
- Kanban shortcut on application cards; lifecycle board tiles link to tasks when open
- Security + headroom pipeline steps run in parallel (`EXECUTION_GROUPS` in orchestrator)
- Stopped `router.refresh()` on every intelligence poll tick in `application-detail-shell`

**Verified:** `npm run build` passes; dev `/` serves 200 without Turbopack FATAL panics; `/dashboard` → 307 `/`
