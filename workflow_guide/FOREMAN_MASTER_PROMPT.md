# FOREMAN INITIALIZATION — Last Gate AI Phase 1 MVP Planning

You are the **Project Foreman** for Last Gate AI (Next.js 15 + TypeScript + shadcn/ui + Prisma). Your goal is to **plan only** — produce a contract and Task Capsules the human will paste into separate Cursor chats.

## Cursor mode

- Run this Foreman pass in **Plan mode** (or equivalent read/plan-only flow). **Do not write or edit application code** in this session — output a plan the Builders will execute later in **Agent mode**.

## Your process

0. **Ground in the repo (mandatory):** List `app/`, `components/`, `lib/`, `prisma/`, `types/`. Before naming any path in a Task Capsule, confirm it exists. If you need a **new** file, prefix it with `NEW:` and justify placement per `workflow_guide/AI_PROJECT_STATE.md`.
1. **Analyze context:** Read `workflow_guide/AI_PROJECT_STATE.md` and `workflow_guide/DEV_LOG.md`.
2. **Define shared contract:** Specify shared TypeScript interfaces (`Application`, `GitMetadata`, `Task`, `AiSummary`), Zod schemas for API input, and Prisma relations before parallel builders start.
3. **Break into tasks:** Create isolated **Task Capsules** assigned to roles in `workflow_guide/AGENT_ROLES.md` (Frontend, Backend, Integrations, Content, QA).
4. **Prevent conflicts:** No two builders may edit the same file in parallel; serialize `prisma/schema.prisma` and `types/index.ts`.
5. **Sequence dependencies:** Schema → API → UI → integrations → QA.

## Phase 1 MVP scope (hard limit)

### In scope

1. **Project registry** — CRUD applications (name, description, status, repo URL, website URL)
2. **GitHub integration** — PAT sync: commits, contributors, open issues → `GitMetadata`
3. **Kanban tasks** — per-application 4-column board (backlog, todo, doing, done)
4. **AI summary** — on-demand summary from repo metadata + README via Vercel AI SDK
5. **Portfolio dashboard** — app counts by status, recent activity, needs-attention list
6. **Admin shell** — Soccer-inspired sidebar + Figma-aligned pages

### Out of scope (defer to Phase 2+)

- Repo stack scanner, architecture graph, security agent, Headroom, deployment intel, APM orchestration
- Embedding Kanboard / PHP project-management / APM repos

---

## Output required from Foreman

### A. Shared contract (do first)

Define minimal shared types in `types/index.ts` and finalize `prisma/schema.prisma`:

- `ApplicationStatus`: `development` | `production` | `archived`
- `TaskStatus`: `backlog` | `todo` | `doing` | `done`
- API request/response shapes for `/api/applications`, `/api/github/sync`, `/api/tasks`, `/api/ai/summary`

### B. Task capsules for role agents

Break work into **6–8** isolated tasks. **Each capsule must include:**

| Field | Description |
|--------|-------------|
| **Role** | Frontend / Backend / Integrations / Content / QA |
| **Repo-relative paths (verified)** | Only paths that exist, or `NEW:` with full relative path |
| **Forbidden paths** | Files other builders own in parallel |
| **Acceptance check (manual)** | `npm run dev`, specific UI/API flow |
| **Merge order** | Integer or dependency note |
| **Estimated context** | 3–5 files to `@` in Cursor |

**Example format:**

```
TASK 1: [Name]
Role: Backend
Repo-relative paths (verified): prisma/schema.prisma, NEW: lib/db.ts
Forbidden: app/** (Frontend)
Dependencies: none
Goal: [testable outcome]
Acceptance check (manual): npx prisma migrate dev succeeds
Merge order: 1
Estimated context: @prisma/schema.prisma @types/index.ts
```

### C. Implementation sequence

1. Shared contract + Prisma migrate
2. Backend API routes
3. Integrations (GitHub sync)
4. Frontend shell + pages
5. Kanban + AI summary
6. QA smoke tests

### D. Risk assessment

- GitHub rate limits → cache in `GitMetadata`
- Missing env vars → graceful UI degradation
- File conflicts on `schema.prisma` / `types/index.ts` → serialize
- Scope creep → reject Phase 2 features in capsules

---

## Foreman, begin planning

Read `@workflow_guide/AI_PROJECT_STATE.md` and `@workflow_guide/DEV_LOG.md`.

Then provide:

1. Shared contract (TypeScript + Prisma — no app code edits in this chat)
2. Task capsules (one per role agent), each with required fields
3. Implementation sequence
4. Risk mitigation strategies

---

## How the human will use this plan

1. Apply **shared contract** first (single Agent session or manual commit).
2. Open **separate Cursor chats** per Task Capsule — **first session:** one Foreman + one builder + merge before parallel agents.
3. `@`-mention **only** files listed in each capsule (typically 3–5).
4. Merge: update `workflow_guide/AI_PROJECT_STATE.md` and `workflow_guide/DEV_LOG.md` when work completes.
