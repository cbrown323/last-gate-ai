# AI PROJECT STATE — Last Gate AI

## Project overview

| Field | Value |
|--------|--------|
| **Name** | Last Gate AI |
| **Type** | Project Intelligence Platform — personal OS for software portfolios |
| **Tagline** | Manage applications, not just tasks |
| **Deployment** | Vercel (target); SQLite local dev |
| **Design refs** | [Figma Make](https://www.figma.com/make/cXKhrU0TJOCy0oBTUQSZOS/Project-Management-App), [Soccer Admin Template](https://preview.themeforest.net/item/soccer-project-management-admin-template-ui-kit/full_screen_preview/24646866) |

## Tech stack

| Layer | Choice |
|--------|--------|
| **Framework** | Next.js 15 App Router |
| **Language** | TypeScript (strict) |
| **UI** | shadcn/ui + Tailwind CSS + lucide-react |
| **Charts** | Recharts via shadcn chart components |
| **Theme** | next-themes (light/dark; dark sidebar default) |
| **Database** | Prisma + SQLite (dev) → PostgreSQL (prod) |
| **GitHub** | @octokit/rest |
| **AI** | Vercel AI SDK (`ai` package) |
| **Package manager** | npm |

## Environment variables

```
DATABASE_URL="file:./dev.db"
GITHUB_TOKEN=              # PAT for repo sync (server-only)
AI_GATEWAY_API_KEY=        # Vercel AI Gateway or provider key
CRON_SECRET=               # Protects /api/cron/portfolio-refresh
```

Never commit `.env.local`. Document only variable names here.

## Directory map

```
last-gate-ai/
├── AGENTS.md
├── workflow_guide/           # Foreman kit
├── .cursor/rules/
├── app/
│   ├── layout.tsx
│   ├── page.tsx              # → redirect /dashboard
│   ├── (dashboard)/
│   │   ├── layout.tsx        # Sidebar shell
│   │   ├── dashboard/page.tsx
│   │   ├── applications/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── tasks/page.tsx
│   │   └── settings/page.tsx
│   └── api/
│       ├── applications/
│       ├── github/sync/
│       ├── tasks/
│       └── ai/summary/
├── components/
│   ├── ui/                   # shadcn
│   ├── layout/               # AppSidebar, TopBar, PageHeader
│   ├── applications/         # AppCard, GitStats, KanbanBoard
│   └── charts/               # Portfolio charts
├── lib/
│   ├── db.ts
│   ├── utils.ts
│   ├── github/
│   └── ai/
├── prisma/schema.prisma
└── types/index.ts
```

## Figma exploration notes (2026-06-21)

Figma MCP required authentication during bootstrap; web fetch to the Make file timed out. Design implementation uses:

- **Soccer template patterns:** dark sidebar, emerald accent, stat widget cards, dense admin layout, chart panels
- **Planned Figma routes:** dashboard, applications list, app detail, kanban, settings (all mapped and implemented)
- **Re-auth Figma MCP** to extract exact typography/colors from [Figma Make file](https://www.figma.com/make/cXKhrU0TJOCy0oBTUQSZOS/Project-Management-App) and align tokens

## Figma → route mapping

| Figma screen (Make file) | Next route | Status |
|--------------------------|------------|--------|
| Dashboard / Home | `/dashboard` | Implemented — extended with portfolio widgets |
| Projects / Apps list | `/applications` | Implemented — registry CRUD |
| Project detail | `/applications/[id]` | Implemented — tabs: Overview, Git, Summary |
| Kanban | `/applications/[id]/tasks` | Implemented — 4-column board |
| Settings | `/settings` | Implemented — GitHub token note |

## Known UI debt (not in Figma — product vision)

- [ ] Health score panel (security, performance, docs, testing)
- [ ] Architecture mapper **interactive graph** (Mermaid text exists)
- [ ] Deployment intelligence map with live Vercel/Railway/Supabase sync
- [ ] Security agent findings UI polish (Semgrep/Trivy not integrated)
- [ ] Optimization / Headroom report panel polish
- [ ] Portfolio cost rollup
- [ ] Maintenance risk badge
- [ ] AI task generation → Cursor/Claude export

## Module checklist (Phase 1 MVP)

- [x] Project registry — CRUD applications
- [x] GitHub integration — sync metadata into `GitMetadata`
- [x] Kanban tasks — per-app 4-column board
- [x] AI summary generator — on-demand (env-gated)
- [x] Portfolio dashboard — stats, status chart, attention list
- [x] Admin shell — Soccer-inspired sidebar + topbar

## Phase 2 — Stack & architecture (done)

- [x] Repo stack scanner (`package.json`, `go.mod`, etc.)
- [x] Architecture mapper (Mermaid diagram; interactive graph deferred)

## Phase 3 — Agents & deployments (done)

- [x] Security agent (heuristics + optional AI; Semgrep/Trivy deferred)
- [x] Headroom optimization agent
- [x] Deployment tracking (file detection + manual log)

## Phase 4 — Automation (in progress)

- [x] `IntelligenceJob` model — persisted pipeline runs
- [x] Server-side orchestrator — `lib/applications/run-intelligence-pipeline.ts`
- [x] Job API — `POST /api/intelligence/run`, `GET /api/intelligence/jobs/[id]`
- [x] UI polling — guided analysis uses server jobs
- [x] Portfolio refresh — dashboard button + `POST /api/intelligence/portfolio-refresh`
- [x] Weekly cron — `vercel.json` → `/api/cron/portfolio-refresh` (stale apps, 7-day threshold)
- [ ] Parallel step execution (security + headroom after stack scan)
- [ ] Durable job queue beyond Vercel function limits (Redis/Inngest)

## Deferred (Phase 5+)

- [ ] Full APM multi-agent orchestration beyond intelligence pipeline
- [ ] **Speculative project cost estimation** — surface a projected monthly
      spend per project derived from its connected apps/services (hosting, DB,
      AI, third-party APIs). _Integration design is unsolved:_ need a way to
      learn what the user actually pays per service — candidate sources include
      provider billing APIs (Vercel/AWS/etc.), Stripe/receipts parsing, or a
      manual per-service cost catalog the user fills in. Until that data path
      is figured out, the dashboard "Monthly Cost / Estimated cost" numbers
      stay illustrative only. (Idea from the Figma "ORBIT" concept; the UI slot
      is good, the data plumbing behind it is the open problem.)

## Reference repos (patterns only — do not embed)

- [Kanboard](https://github.com/kanboard/kanboard) — kanban UX
- [project-management PHP](https://github.com/devaslanphp/project-management) — dashboards
- [APM](https://github.com/sdi2200262/agentic-project-management) — agent capsules
- [Headroom](https://github.com/chopratejas/headroom) — optimization reports

## Data model (Prisma)

- `Application` — name, description, status, repoUrl, websiteUrl, owner
- `GitMetadata` — lastCommitAt, commitCount, contributorCount, openIssues, defaultBranch, syncedAt
- `Task` — title, status (backlog|todo|doing|done), position
- `AiSummary` — content, generatedAt per application

- `Deployment` — platform, status, url, version
- `IntelligenceJob` — pipeline run status, currentStep, stepResults, trigger (manual|cron|portfolio)

## Known issues

1. **GitHub sync** requires `GITHUB_TOKEN` — UI shows error state when missing
2. **AI summary** returns graceful message when `AI_GATEWAY_API_KEY` unset
3. **Figma tokens** — design uses Soccer-inspired palette until Figma MCP re-auth for exact tokens
4. **Intelligence pipeline** — Vercel function timeout (~60s) may limit very large repos; portfolio cron runs sequentially

---

**Last updated:** 2026-06-24
