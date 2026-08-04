# Last Gate AI

Project Intelligence Platform — a personal operating system for software portfolios.

## Stack

- Next.js 16 App Router + TypeScript
- shadcn/ui + Tailwind CSS
- Prisma 7 + SQLite (dev)
- GitHub API + Vercel AI SDK

## Getting started

```bash
cp .env.example .env.local
# Add GITHUB_TOKEN for GitHub sync
# Add AI_GATEWAY_API_KEY or OPENAI_API_KEY for live AI summaries

npm install
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the portfolio dashboard (`/dashboard` redirects to `/`).

### Connect integrations

Use **Settings** for the guided wizard (GitHub → AI → Vercel → Railway). See [`workflow_guide/INTEGRATIONS_WORKFLOW.md`](workflow_guide/INTEGRATIONS_WORKFLOW.md) for the full workflow.

### First application

1. **Applications** → **Import from GitHub** (with `GITHUB_TOKEN` set) or register an app manually with your GitHub repo URL.
2. **Settings** → verify GitHub and AI integrations (add keys to `.env.local`, restart `npm run dev`).
3. Open the app → **Run full analysis** or use **Intelligence** sub-tabs step by step.

### Test live AI summaries

1. **Settings** — confirm AI integration shows configured (add a key and restart `npm run dev` if needed).
2. **Applications** → open an app with a linked repo.
3. **Overview** → sync git stats (needs `GITHUB_TOKEN`) for richer context.
4. **Intelligence** → **AI Summary** → **Generate** — live AI when a key is set; offline template otherwise.

To remove a legacy demo app from an older database: `npm run db:seed`

## Workflow

Agent workflow docs live in [`workflow_guide/`](workflow_guide/). Start with:

- [`workflow_guide/COPY_PASTE_PROMPTS.md`](workflow_guide/COPY_PASTE_PROMPTS.md) — TAB 1 Foreman
- [`workflow_guide/FOREMAN_MVP_CAPSULES.md`](workflow_guide/FOREMAN_MVP_CAPSULES.md) — Phase 1 capsules (implemented)

## Phase 1 MVP

- Application registry (CRUD)
- GitHub metadata sync
- Per-app Kanban tasks
- AI project summaries (env-gated)
- Portfolio dashboard with stats and charts

## Phase 2 — Stack & architecture

- **Stack scanner** — `/applications/[id]` → **Stack** tab → **Scan repo** (needs `GITHUB_TOKEN`)
- **Architecture mapper** — **Architecture** tab → **Map architecture** (uses repo tree + stack scan)

```bash
curl -X POST http://localhost:3000/api/stack/scan \
  -H "Content-Type: application/json" \
  -d '{"applicationId":"<APP_ID>"}'

curl -X POST http://localhost:3000/api/architecture/map \
  -H "Content-Type: application/json" \
  -d '{"applicationId":"<APP_ID>"}'
```

## Phase 3 — Agents & deployments

- **Security agent** — **Security** tab → **Run scan** (heuristics + optional AI)
- **Headroom** — **Headroom** tab → **Analyze** (scale readiness)
- **Deployments** — **Deployments** tab → detect platform files or log manually

```bash
curl -X POST http://localhost:3000/api/agents/security \
  -H "Content-Type: application/json" \
  -d '{"applicationId":"<APP_ID>"}'

curl -X POST http://localhost:3000/api/agents/headroom \
  -H "Content-Type: application/json" \
  -d '{"applicationId":"<APP_ID>"}'

curl -X POST http://localhost:3000/api/deployments \
  -H "Content-Type: application/json" \
  -d '{"applicationId":"<APP_ID>","detect":true}'
```

## Phase 4 — Automation

- **Guided analysis** — Intelligence tab runs the full pipeline server-side; UI polls job progress
- **Portfolio refresh** — Dashboard → **Refresh intelligence** (all apps with linked repos)
- **Weekly cron** — `vercel.json` schedules `/api/cron/portfolio-refresh` for stale apps (7+ days)

```bash
# Start a server-side intelligence job
curl -X POST http://localhost:3000/api/intelligence/run \
  -H "Content-Type: application/json" \
  -d '{"applicationId":"<APP_ID>","fromBeginning":false}'

# Poll job status
curl http://localhost:3000/api/intelligence/jobs/<JOB_ID>

# Manual cron trigger (dev: no CRON_SECRET required)
curl -X POST http://localhost:3000/api/cron/portfolio-refresh
```

## Phase 4.5 — UX polish

- **Dashboard at `/`** — sidebar and logo link home; `/dashboard` redirects for old bookmarks
- **Board | Roadmap switcher** — on app detail, tasks, and roadmap pages (top right)
- **Task deep links** — search and overdue tasks open `/applications/[id]/tasks?task=[taskId]`
- **Kanban shortcuts** — board icon on application cards; lifecycle tiles with open tasks go to the board
- **Stable dev server** — removed Turbopack root override that caused home-page reload loops
