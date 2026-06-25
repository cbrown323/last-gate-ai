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
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → redirects to `/dashboard`.

### Connect integrations (recommended)

Use **Settings → Connect your stack** for a guided wizard (GitHub → AI → Vercel → Railway). See [`workflow_guide/INTEGRATIONS_WORKFLOW.md`](workflow_guide/INTEGRATIONS_WORKFLOW.md) for the full workflow.

### Preview without integrations (recommended first)

No `GITHUB_TOKEN` or AI keys needed — load the dry-run demo:

```bash
npm run db:seed
```

Or from the **Dashboard** / **Settings** banner, click **Load demo preview**. Then open **Last Gate AI (demo)** and explore every tab (Stack, Architecture, Security, Headroom, Deployments, Kanban).

### Test live AI summaries

1. Open **Settings** — confirm **AI integration status** shows **Ready** (or add a key and restart `npm run dev`).
2. Go to **Applications** → open **Last Gate AI (demo)** (from seed) or create your own app with a GitHub repo URL.
3. Optional: **Overview** tab → **Sync now** (needs `GITHUB_TOKEN`) for richer context.
4. **AI Summary** tab → **Generate** — live AI when a key is set; offline template otherwise.

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
