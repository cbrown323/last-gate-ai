# AGENT ROLES — Last Gate AI Multi-Agent System

## Overview

Six specialized roles for Last Gate AI (Next.js 15 + TypeScript + Prisma). Each agent has specific responsibilities and path ownership.

---

## ROLE 1: FOREMAN (Planning & Coordination)

**Purpose:** Break features into isolated tasks, prevent conflicts, define shared contracts.

**Responsibilities:**
- Read `workflow_guide/AI_PROJECT_STATE.md` and `DEV_LOG.md`
- Define TypeScript interfaces in `types/` and Prisma boundaries
- Create Task Capsules per role agent
- Sequence dependencies; flag parallel-safe work

**Files:** ALL (read-only)

**Output:** Shared Contract → Task Capsules → Sequence → Risks

**Prompt:**
```
@workflow_guide/FOREMAN_MASTER_PROMPT.md
@workflow_guide/AI_PROJECT_STATE.md
@workflow_guide/DEV_LOG.md

Plan: [FEATURE_REQUEST]
```

---

## ROLE 2: FRONTEND DEVELOPER (UI/UX)

**Purpose:** Dashboard shell, pages, shadcn components, client interactivity.

**Owns:**
- `app/(dashboard)/**`
- `components/**` (except pure server lib)
- `hooks/**`

**Cannot touch:** `app/api/**`, `prisma/**`, `lib/github/**` (unless capsule includes joint work)

**Constraints:**
- Server Components by default; `"use client"` only when needed
- Use shadcn/ui primitives from `components/ui/`
- Soccer-inspired density: sidebar, stat cards, data tables

---

## ROLE 3: BACKEND DEVELOPER (API & Data)

**Purpose:** Route Handlers, Prisma, validation, business logic.

**Owns:**
- `app/api/**`
- `lib/db.ts`, `lib/utils.ts`
- `prisma/schema.prisma`, migrations

**Cannot touch:** `components/**` layout styling (defer to Frontend)

**Constraints:**
- Zod validation on API inputs
- Proper HTTP status codes
- Never expose secrets to client

---

## ROLE 4: INTEGRATIONS DEVELOPER (GitHub & AI)

**Purpose:** External service clients and sync logic.

**Owns:**
- `lib/github/**`
- `lib/ai/**`
- `app/api/github/**`, `app/api/ai/**`

**Cannot touch:** Dashboard layout components

**Constraints:**
- `GITHUB_TOKEN` and `AI_GATEWAY_API_KEY` server-only
- Cache Git metadata in DB; handle rate limits
- Graceful degradation when env vars missing

---

## ROLE 5: CONTENT AGENT (Copy & UX text)

**Purpose:** Labels, empty states, tooltips, page titles, error messages.

**Owns:** String content in `app/**` and `components/**` (text only)

**Cannot touch:** API logic, Prisma schema, integration code

---

## ROLE 6: QA AGENT (Testing & Review)

**Purpose:** Smoke tests, edge cases, accessibility, API verification.

**Owns:** `__tests__/**` when added; read-only elsewhere by default

**Constraints:** WCAG AA where feasible; test missing env var paths

---

## Agent interaction flow

```
USER → FOREMAN → Capsules
         ↓
    Frontend | Backend | Integrations | Content (parallel when safe)
         ↓
       QA review
         ↓
    Merge DEV_LOG + AI_PROJECT_STATE → Commit
```

---

## Constraints summary

| Agent | CAN touch | CANNOT touch |
|-------|-----------|--------------|
| Foreman | All (read) | Direct code changes |
| Frontend | app/(dashboard), components, hooks | api, prisma, github lib |
| Backend | api, lib/db, prisma | component styling |
| Integrations | lib/github, lib/ai, sync routes | dashboard layout |
| Content | UI copy strings | API/schema logic |
| QA | tests, read review | production code without capsule |

---

## Quick start

1. Foreman → plan
2. Backend + Integrations → API + sync (serialize schema first)
3. Frontend → shell + pages
4. Content → polish copy
5. QA → verify
6. Merge docs → commit
