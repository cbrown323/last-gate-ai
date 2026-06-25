# FOREMAN MVP CAPSULES — Last Gate AI Phase 1

Pre-generated Foreman output for Phase 1 MVP. Use with `workflow_guide/COPY_PASTE_PROMPTS.md` TAB 2–6.

---

## 1. SHARED CONTRACT

**Types** (`types/index.ts`):
- `ApplicationStatus`, `TaskStatus`, `Application`, `GitMetadata`, `Task`, `AiSummary`, `PortfolioStats`

**Prisma** (`prisma/schema.prisma`):
- `Application`, `GitMetadata`, `Task`, `AiSummary` with cascade deletes

**API shapes:**
- `POST /api/applications` — create registry entry
- `GET/PUT/DELETE /api/applications/[id]`
- `POST /api/github/sync` — `{ applicationId }`
- `GET/POST /api/tasks` — kanban CRUD
- `PATCH/DELETE /api/tasks/[id]`
- `POST /api/ai/summary` — `{ applicationId }`

---

## 2. TASK CAPSULES

### TASK 1: Shared contract + Prisma
**Role:** Backend  
**Paths:** `prisma/schema.prisma`, `types/index.ts`, `lib/db.ts`  
**Forbidden:** `app/**`, `components/**`  
**Merge order:** 1  
**Acceptance:** `npx prisma migrate dev` succeeds  

### TASK 2: Applications API
**Role:** Backend  
**Paths:** `app/api/applications/route.ts`, `app/api/applications/[id]/route.ts`  
**Forbidden:** `components/**`  
**Dependencies:** Task 1  
**Acceptance:** POST/GET applications via curl or UI  

### TASK 3: GitHub sync
**Role:** Integrations  
**Paths:** `lib/github/**`, `app/api/github/sync/route.ts`  
**Forbidden:** dashboard layout  
**Dependencies:** Task 2  
**Acceptance:** Sync with `GITHUB_TOKEN` updates git stats  

### TASK 4: Admin shell + dashboard
**Role:** Frontend  
**Paths:** `app/(dashboard)/layout.tsx`, `components/layout/**`, `app/(dashboard)/dashboard/page.tsx`, `components/charts/**`  
**Forbidden:** `app/api/**`  
**Dependencies:** Task 1  
**Acceptance:** Sidebar, topbar, stat cards render  

### TASK 5: Applications list + detail
**Role:** Frontend  
**Paths:** `app/(dashboard)/applications/**`, `components/applications/application-*.tsx`  
**Forbidden:** `lib/github/**`  
**Dependencies:** Task 2, 4  
**Acceptance:** CRUD UI, detail tabs  

### TASK 6: Kanban + AI summary
**Role:** Frontend + Backend  
**Paths:** `app/api/tasks/**`, `app/api/ai/summary/route.ts`, `lib/ai/summary.ts`, kanban components  
**Dependencies:** Task 2, 3  
**Acceptance:** Tasks board works; summary generates (or offline fallback)  

### TASK 7: QA smoke
**Role:** QA  
**Paths:** read-only review  
**Acceptance:** `npm run build` passes; manual flow: add app → sync → task → summary  

---

## 3. IMPLEMENTATION SEQUENCE

1 → 2 → (3 parallel with 4 after 1) → 5 → 6 → 7

---

## 4. RISKS

| Risk | Mitigation |
|------|------------|
| Missing GITHUB_TOKEN | Graceful error in sync UI |
| Missing AI key | Offline markdown fallback |
| Prisma conflicts | Serialize Task 1 |

**Status:** Implemented in bootstrap session 2026-06-21.
